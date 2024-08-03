import passport from "passport";
import UserDTO from "../dto/user.dto.js";

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

        console.log("Usuario autenticado:", req.session.user);

        if (user.role === 'admin') {
            return res.redirect('/admin/products');
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