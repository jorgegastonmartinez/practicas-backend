import ProductDAO from '../dao/product/product.dao.js';

const productDAO = new ProductDAO();

export const getProducts = async (req, res) => {
    let { limit = 10, page = 1, sort, query } = req.query;
    limit = parseInt(limit);
    page = parseInt(page);

    try {
        let filter = {};
        if (query) {
            filter = {
                $or: [
                    { category: query },
                    { stock: { $gt: 0 } }
                ]
            };
        }

        let sortOptions = {};
        if (sort) {
            sortOptions.price = sort === "asc" ? 1 : -1;
        }

        const { products, totalProducts } = await productDAO.getProducts(filter, sortOptions, limit, page);
        const totalPages = Math.ceil(totalProducts / limit);

        const response = {
            status: "success",
            payload: products,
            totalPages,
            prevPage: page > 1 ? page - 1 : null,
            nextPage: page < totalPages ? page + 1 : null,
            page,
            hasPrevPage: page > 1,
            hasNextPage: page < totalPages,
            prevLink: page > 1 ? `/products?limit=${limit}&page=${page - 1}&sort=${sort || ''}&query=${query || ''}` : null,
            nextLink: page < totalPages ? `/products?limit=${limit}&page=${page + 1}&sort=${sort || ''}&query=${query || ''}` : null
        };

        res.json(response);
    } catch (error) {
        console.error("Error al recuperar productos", error);
        res.status(500).json({ status: "error", message: "Error Interno del Servidor" });
    }
};

export const getProductById = async (req, res) => {
    try {
        let { pid } = req.params;
        const product = await productDAO.getProductById(pid);
        if (!product) {
            return res.status(400).send({ error: "Producto no encontrado" });
        }
        res.send({ result: "success", payload: product });

    } catch (error) {
        console.error("Error al obtener el producto", error);
        res.status(500).json({ error: "Error al obtener el producto" });
    }
};

export const createProduct = async (req, res) => {
    let { title, description, code, price, stock, category } = req.body;

    if (!title || !description || !code || !price || isNaN(stock) || !category) {
        console.log("Debes completar todos los campos");
        return res.status(400).send({ error: "Debes completar correctamente todos los campos" });
    }
    stock = Number(stock);
    if (stock <= 0) {
        console.log("El STOCK debe ser mayor que 0");
        return res.status(400).send({ error: "El campo STOCK debe ser mayor que 0" });
    }

    try {
        const codeExists = await productDAO.existsByCode(code);

        if (codeExists) {
            console.log("El campo code ya existe con ese número");
            return res.status(400).send({ error: "El campo code ya existe con ese número" });
        }

        const result = await productDAO.createProduct({
            title,
            description,
            code,
            price,
            stock,
            category,
        });

        res.send({ result: "success", payload: result });

    } catch (error) {
        console.error("Error al crear el producto", error);
        res.status(500).send({ error: "Error al crear el producto" });
    }
};

export const updateProduct = async (req, res) => {
    let { pid } = req.params;
    let productToUpdate = req.body;

    if (!productToUpdate.title || !productToUpdate.description || !productToUpdate.code || !productToUpdate.price || isNaN(productToUpdate.stock) || !productToUpdate.category) {
        return res.status(400).send({ status: "Error", error: "Debe completar todos los campos del producto" });
    }

    try {
        const product = await productDAO.getProductById(pid);
        if (!product) {
            return res.status(400).send({ error: "Producto no encontrado" });
        }

        const codeExists = await productDAO.existsByCode(productToUpdate.code, pid);

        if (codeExists) {
            return res.status(400).send({ error: "El campo code ya está siendo utilizado por otro producto" });
        }

        const result = await productDAO.updateProduct(pid, productToUpdate);

        res.send({ result: "success", payload: result });

    } catch (error) {
        console.error("Error al actualizar el producto", error);
        res.status(500).send({ error: "Error al actualizar el producto" });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        let { pid } = req.params;
        await productDAO.deleteProduct(pid);
        res.send({ result: "success", payload: { deletedCount: 1 } });
    } catch (error) {
        console.error("El producto no se ha podido eliminar", error);
        res.status(500).send({ error: "El producto no se ha podido eliminar" });
    }
};