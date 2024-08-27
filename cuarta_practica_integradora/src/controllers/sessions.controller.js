import passport from "passport";
import UserDTO from "../dto/user.dto.js";
import User from '../models/user.model.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

export const registerUser = (req, res, next) => {
    passport.authenticate("register", { failureRedirect: "/failregister" }, (err, user, info) => {
        if (err) {
        return next(err);
    }
        if (!user) {
        return res.redirect("/failregister");
    }
    req.logIn(user, (err) => {
        if (err) {
        return next(err);
        }
        return res.redirect("/login");
        });
    })(req, res, next);
};

export const failRegister = (req, res) => {
    console.log("Estrategia fallida");
    res.send({ error: "Falló" });
};

export const loginUser = (req, res, next) => {
    passport.authenticate("login", { failureRedirect: "/faillogin" }, (err, user, info) => {
    if (err) {
        return next(err);
    }
    if (!user) {
        return res.status(400).send({ status: "Error", error: "Error al iniciar sesión" });
    }
    req.logIn(user, (err) => {
        if (err) {
        return next(err);
        }

        req.session.user = {
            _id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            age: user.age,
            cart: user.cart,
            role: user.role,
        };

        if (user.role === 'admin') {
            return res.redirect('/admin/products');
        } else if (user.role === 'premium') {
            return res.redirect('premium/products')
        } else if (user.role === 'user' || "User") {
            return res.redirect('/products');
        } else {
            return res.redirect('/not-authorized');
        }
        });
    })(req, res, next);
};

export const failLogin = (req, res) => {
    res.send({ error: "Login fallido" });
};

export const logoutUser = (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).send("Error al cerrar la sesión");
        res.redirect("/login");
    });
};

export const getCurrentUser = (req, res) => {
    try {
        if (!req.session || !req.session.user) {
        return res.redirect("/login");
    }
    const userDTO = new UserDTO(req.session.user);
    console.log(userDTO); 
    
    res.render('current', { user: userDTO, isAdmin: req.session.user.role === 'admin' });
    } catch (error) {
        console.error("Error al obtener el usuario actual:", error);
        return res.status(500).send({ error: "Error al obtener el usuario actual" });
    }
};

export const githubCallback = (req, res) => {
    req.session.user = req.user;
    res.redirect("/products");
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).send('Usuario no encontrado')
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    
    await user.save();
    
    const transport = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    })

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Restablecimiento de Contraseña',
        text: `Has solicitado restablecer tu contraseña.\n\n
            Por favor, haz clic en el siguiente enlace o pégalo en tu navegador para completar el proceso:\n\n
            http://${req.headers.host}/api/sessions/reset-password?token=${token}\n\n
            Si no solicitaste esto, ignora este correo.\n`,
    };

    try {
        transport.sendMail(mailOptions);
        
        res.render('forgot-password-confirmation', { email });
    } catch (err) {
        console.error('Error al enviar el email:', err);
        res.status(500).send('Error al enviar el email');
    }
}

export const renderForgotPassword = (req, res) => {
    res.render('forgot-password');
};

export const renderResetPasswordExpired = (req, res) => {
    res.render('reset-password-expired');
};

export const renderResetPassword = (req, res) => {
    const { token, error } = req.query;
    res.render('reset-password', { token, error });
};

export const resetPassword = async (req, res) => {
    const { token, password } = req.body;
    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.redirect('/api/sessions/reset-password-expired');
        }
        
        for (let oldPassword of user.previousPasswords) {
            const isMatch = await bcrypt.compare(password, oldPassword);
            if (isMatch) {
            return res.redirect(`/api/sessions/reset-password?token=${token}&error=1`);
            }
        }

        if (user.previousPasswords.length >= 3) {
            user.previousPasswords.shift(); 
        }

        user.previousPasswords.push(user.password);
        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();
        
        res.redirect('/'); 
    } catch (error) {
        console.error('Error al restablecer la contraseña:', err);
        return res.status(500).send('Error al restablecer la contraseña');
    }
};