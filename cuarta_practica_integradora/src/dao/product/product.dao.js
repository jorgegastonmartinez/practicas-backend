import productModel from '../../models/product.model.js';

export default class ProductDAO {
    async getProducts(filter = {}, sortOptions = {}, limit = 10, page = 1) {
        try {
            const totalProducts = await productModel.countDocuments(filter);
            const offset = (page - 1) * limit;
            const products = await productModel
                .find(filter)
                .sort(sortOptions)
                .skip(offset)
                .limit(limit);

            return { products, totalProducts };
        } catch (error) {
            console.error("Error en getProducts:", error);
            throw new Error("Error en getProducts");
        }
    }

    async getProductById(pid) {
        try {
            return await productModel.findById(pid);
        } catch (error) {
            console.error("Error en getProductById:", error);
            throw new Error("Error en getProductById");
        }
    }

    async createProduct(productData) {
        try {
            return await productModel.create(productData);
        } catch (error) {
            console.error("Error en createProduct:", error);
            throw new Error("Error en createProduct");
        }
    }

    async updateProduct(pid, productData) {
        try {
            return await productModel.updateOne({ _id: pid }, productData);
        } catch (error) {
            console.error("Error en updateProduct:", error);
            throw new Error("Error en updateProduct");
        }
    }

    async deleteProduct(pid) {
        try {
            return await productModel.deleteOne({ _id: pid });
        } catch (error) {
            console.error("Error en deleteProduct:", error);
            throw new Error("Error en deleteProduct");
        }
    }

    async existsByCode(code, excludeId = null) {
        try {
            const query = excludeId ? { code, _id: { $ne: excludeId } } : { code };
            return await productModel.exists(query);
        } catch (error) {
            console.error("Error en existsByCode:", error);
            throw new Error("Error en existsByCode");
        }
    }
}