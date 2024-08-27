export const getUserFromSession = (req) => {
    if (req.session && req.session.user) {
        return req.session.user;
    } else {
        throw new Error("No hay sesión activa");
    }
};

export const setUserSession = (req, user) => {
    req.session.user = {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        age: user.age,
        cart: user.cart,
        role: user.role,
    };
};