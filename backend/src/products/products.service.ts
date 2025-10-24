import { Injectable } from '@nestjs/common';
import { Product } from './product.entity';

@Injectable()
export class ProductsService {
  private products: Product[] = [
    { id: 1, ruta: '/products/cap2.png', nombre: 'Gorra número 2', precio: 399, description: 'Gorra urbana clásica', stock: 50, category: 'Accesorios' },
    { id: 2, ruta: '/products/shirt1.png', nombre: 'Camisa número 1', precio: 399, description: 'Camisa streetwear', stock: 30, category: 'Ropa' },
    { id: 3, ruta: '/products/gorro1.png', nombre: 'Gorro número 1', precio: 399, description: 'Gorro con logo', stock: 20, category: 'Accesorios' },
    { id: 4, ruta: '/products/shirt2.png', nombre: 'Camisa número 2', precio: 399, description: 'Camisa oversized', stock: 25, category: 'Ropa' },
    { id: 5, ruta: '/products/gorro2.png', precio: 399, nombre: 'Gorro número 2', description: 'Gorro beanie', stock: 15, category: 'Accesorios' },
    { id: 6, ruta: '/products/pants1.png', nombre: 'Pantalón número 1', precio: 399, description: 'Pantalón cargo', stock: 40, category: 'Ropa' },
    { id: 7, ruta: '/products/gorro3.png', nombre: 'Gorro número 3', precio: 399, description: 'Gorro snapback', stock: 35, category: 'Accesorios' },
    { id: 8, ruta: '/products/shirt3.png', nombre: 'Camisa número 3', precio: 399, description: 'Camisa gráfica', stock: 28, category: 'Ropa' },
    { id: 9, ruta: '/products/pants2.png', nombre: 'Pantalón número 2', precio: 399, description: 'Pantalón jogger', stock: 22, category: 'Ropa' }
  ];

  findAll(): Product[] {
    return this.products;
  }

  findOne(id: number): Product | null {
    const product = this.products.find(p => p.id === id);
    return product || null;
  }

  create(product: Omit<Product, 'id'>): Product {
    const newProduct = {
      id: Date.now(),
      ...product,
    };
    this.products.push(newProduct);
    return newProduct;
  }

  update(id: number, updates: Partial<Product>): Product | null {
    const index = this.products.findIndex(p => p.id === id);
    if (index !== -1) {
      this.products[index] = { ...this.products[index], ...updates };
      return this.products[index];
    }
    return null;
  }

  delete(id: number): boolean {
    const index = this.products.findIndex(p => p.id === id);
    if (index !== -1) {
      this.products.splice(index, 1);
      return true;
    }
    return false;
  }
}
