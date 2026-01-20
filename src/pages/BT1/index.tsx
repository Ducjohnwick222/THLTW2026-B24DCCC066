import React, { useState } from 'react';
import type { ColumnsType } from 'antd/es/table';
import { Table, Button, Modal, Input, InputNumber, Popconfirm, message } from 'antd';

// ===== Interface Product =====
interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

// ===== Mock data =====
const initialProducts: Product[] = [
  { id: 1, name: 'Laptop Dell XPS 13', price: 25000000, quantity: 10 },
  { id: 2, name: 'iPhone 15 Pro Max', price: 30000000, quantity: 5 },
  { id: 3, name: 'Samsung Galaxy S24', price: 28000000, quantity: 12 },
  { id: 4, name: 'iPad Air M2', price: 18000000, quantity: 8 },
  { id: 5, name: 'MacBook Air M3', price: 32000000, quantity: 3 },
];

const ProductPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newPrice, setNewPrice] = useState<number | null>(null);
  const [newQuantity, setNewQuantity] = useState<number | null>(null);

  // ===== Add product =====
  const handleAddProduct = (): void => {
    if (!newName.trim()) {
      message.error('Tên sản phẩm không được để trống');
      return;
    }
    if (!newPrice || newPrice < 1) {
      message.error('Giá phải là số dương');
      return;
    }
    if (!newQuantity || newQuantity < 1) {
      message.error('Số lượng phải là số nguyên dương');
      return;
    }

    const newProduct: Product = {
      id: Date.now(),
      name: newName,
      price: newPrice,
      quantity: newQuantity,
    };

    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    setFilteredProducts(updatedProducts);
    message.success('Thêm sản phẩm thành công');
    setIsModalOpen(false);
    setNewName('');
    setNewPrice(null);
    setNewQuantity(null);
  };

  // ===== Delete product =====
  const handleDelete = (id: number): void => {
    const newList = products.filter((item: Product) => item.id !== id);
    setProducts(newList);
    setFilteredProducts(newList);
    message.success('Xóa sản phẩm thành công');
  };

  // ===== Search product =====
  const handleSearch = (value: string): void => {
    const keyword = value.toLowerCase();
    const result = products.filter((item: Product) =>
      item.name.toLowerCase().includes(keyword),
    );
    setFilteredProducts(result);
  };

  // ===== Table columns =====
  const columns: ColumnsType<Product> = [
    {
      title: 'STT',
      render: (_: unknown, __: Product, index: number) => index + 1,
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      render: (price: number) => price.toLocaleString('vi-VN') + ' đ',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
    },
    {
      title: 'Thao tác',
      render: (_: unknown, record: Product) => (
        <Popconfirm
          title="Bạn có chắc chắn muốn xóa sản phẩm này?"
          onConfirm={() => handleDelete(record.id)}
        >
          <Button danger size="small">Xóa</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>Quản lý sản phẩm</h2>

      <Input.Search
        placeholder="Tìm kiếm theo tên sản phẩm"
        onChange={(e) => handleSearch(e.target.value)}
        style={{ width: 300, marginBottom: 16 }}
      />

      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setIsModalOpen(true)}>
          Thêm sản phẩm
        </Button>
      </div>

      <Table<Product>
        rowKey="id"
        columns={columns}
        dataSource={filteredProducts}
      />

      <Modal
        title="Thêm sản phẩm mới"
        open={isModalOpen}
        onOk={handleAddProduct}
        onCancel={() => {
          setIsModalOpen(false);
          setNewName('');
          setNewPrice(null);
          setNewQuantity(null);
        }}
        okText="Thêm"
        cancelText="Hủy"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Tên sản phẩm</label>
            <Input 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nhập tên sản phẩm"
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Giá</label>
            <InputNumber 
              value={newPrice}
              onChange={(val) => setNewPrice(val)}
              min={1}
              style={{ width: '100%' }}
              placeholder="Nhập giá"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Số lượng</label>
            <InputNumber 
              value={newQuantity}
              onChange={(val) => setNewQuantity(val)}
              min={1}
              style={{ width: '100%' }}
              placeholder="Nhập số lượng"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductPage;