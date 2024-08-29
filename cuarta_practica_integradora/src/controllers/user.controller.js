import User from '../dao/user/user.dao.js';
import path from 'path';

const usersService = new User()

export const getUsers = async (req, res) => {
    let result = await usersService.getUsers()
    res.send({ status: "success", result })
}

export const getUserById = async (req, res) => {
    try {
        const { uid } = req.params;
        const user = await usersService.getUserById(uid);
        if (!user) {
            return res.status(404).send({ status: "error", message: "User not found" });
        }
        res.send({ status: "success", result: user });
    } catch (error) {
        console.error("Error al obtener el usuario:", error);
        res.status(500).send({ status: "error", message: "Error al obtener el usuario" });
    }
};

export const updateUser = async (req, res) => {
    const { uid } = req.params;
    const updatedData = req.body;
    try {
        const result = await usersService.updateUser(uid, updatedData);
        if (result.nModified === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado o los datos no cambiaron' });
        }
        res.status(200).json({ message: 'Usuario actualizado exitosamente.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el usuario.', error });
    }
};

export const saveUser = async (req, res) => {
    const user = req.body
    let result = await usersService.saveUser(user)
    res.send({ status: "success", result })
};

export const uploadDocuments = async (req, res) => {
    const { uid } = req.params;
    const files = req.files;

    if (!files || files.length === 0) {
        return res.status(400).json({ message: 'No se subieron correctamente los archivos.' });
    }

    const documentData = files.map(file => ({
        name: file.originalname,
        reference: file.path
    }));

    try {
        const user = await usersService.getUserById(uid);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        await usersService.addDocuments(uid, documentData);

        res.status(200).json({ message: 'Documentos subidos correctamente', documents: documentData });
    } catch (error) {
        res.status(500).json({ message: 'Error al subir los documentos', error });
    }
};

export const updateLastConnection = async (req, res) => {
    const { uid } = req.params;
    const date = new Date();

    try {
        const result = await usersService.updateLastConnection(uid, date);
        if (result.nModified === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado o la conexión no cambió' });
        }
        res.status(200).json({ message: 'Última conexión actualizada exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la última conexión', error });
    }
};

export const upgradeToPremium = async (req, res) => {
    const { uid } = req.params;

    try {
        const user = await usersService.getUserById(uid);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const requiredDocuments = [
          "identificacion",
          "comprobante de domicilio",
          "comprobante de estado de cuenta",
        ];
        const uploadedDocumentNames = user.documents.map(doc => path.parse(doc.name).name);
        const missingDocuments = requiredDocuments.filter(doc => !uploadedDocumentNames.includes(doc));

        if (missingDocuments.length > 0) {
            return res.status(400).json({ message: 'Faltan subir documentos requeridos', missingDocuments });
        }
        user.role = 'premium';
        await usersService.updateUser(uid, user);

        res.status(200).json({ message: 'El rol del usuario se ha actualizado a premium' });
    } catch (error) {
        console.error('Error al actualizar el rol a premium:', error);
        res.status(500).json({ message: 'Error al actualizar el rol a premium', error });
    }
};