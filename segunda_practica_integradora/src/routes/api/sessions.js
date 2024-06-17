import { Router } from "express";
import passport from "passport";
import { isAuthenticated } from "../../middleware/auth.js";

const router = Router();

router.post("/register", passport.authenticate("register", {failureRedirect: "failregister"}), async (req, res) => {
  res.redirect("/login");
  });

router.get("/failregister", async (req, res) => {
    console.log("Estrategia fallida")
    res.send({error: "Falló"})
})

router.post("/login", passport.authenticate("login", {failureRedirect: "faillogin"}), async (req, res) => {
    if (!req.user) {
      res.status(400).send({ status: "Error", error: "Campos incompletos" });
      return;
    }
    try {
    req.session.user ={
      _id: req.user._id,
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      email: req.user.email,
      age: req.user.age,
      role: req.user.role
    };
    res.redirect("/products");

    } catch (error) {
    res.status(500).send("Error en el inicio de sesion")
    }
});

router.get("/faillogin", (req, res) => {
  res.send({error: "Login fallido"})
})

router.post("/logout", (req, res) => {
  
    req.session.destroy((err) => {
        if (err) return res.status(500).send("Error al cerrar la sesión");
        res.redirect("/login")
    });
});

router.get("/current", isAuthenticated, (req, res) => {
  try {
      if (!req.session || !req.session.user) {
        return res.redirect("/login");
      }
      res.render("current", { user: req.session.user });
  } catch (error) {
      console.error("Error al obtener el usuario actual:", error);
      return res.status(500).send({ error: "Error al obtener el usuario actual" });
  }
});

router.get("/github", passport.authenticate("github", {scope: ["user.email"]}), async (req, res) => {
})

router.get("/githubcallback", passport.authenticate("github", {failureRedirect: "/login"}), async (req, res) => {
  req.session.user = req.user;
  res.redirect("/products")
})

export default router;