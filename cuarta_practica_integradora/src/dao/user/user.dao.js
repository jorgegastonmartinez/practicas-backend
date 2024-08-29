import usersModel from "../../models/user.model.js";

export default class User {
    getUsers = async () => {
        try {
            let users = await usersModel.find()
            return users
        } catch (error) {
            console.log(error)
            return null
        }
    }

    getUserById = async (id) => {
        try {
            let user = await usersModel.findOne({ _id: id })
            return user;
        } catch (error) {
            console.error("Error al obtener el usuario:", error);
            throw new Error("Ocurrió un error al obtener el usuario");
        }
    }

    saveUser = async (user) => {
        try {
            let result = await usersModel.create(user)
            return result
        } catch (error) {
            console.log(error)
        }
    }

    updateUser = async (id, user) => {
        try {
            let result = await usersModel.updateOne({ _id: id }, { $set: user })
            return result
        } catch (error) {
            console.log(error)
        }
    }

    addDocuments = async (id, documents) => {
        try {
            const result = await usersModel.updateOne(
                { _id: id },
                { $push: { documents: { $each: documents } } }
            );
            return result;
        } catch (error) {
            console.error("Error al agregar documentos:", error);
            throw new Error("Ocurrió un error al agregar documentos");
        }
    }

    updateLastConnection = async (id, date) => {
        try {
            const result = await usersModel.updateOne(
                { _id: id },
                { $set: { last_connection: date } }
            );
            return result;
        } catch (error) {
            console.error("Error al actualizar last_connection:", error);
            throw new Error("Ocurrió un error al actualizar la última conexión");
        }
    }
}