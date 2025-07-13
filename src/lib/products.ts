// src/lib/products.ts
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export interface Product {
  id?: string;
  genericName: string;
  description: string;
  packingSizes: string[];
  category: "Human" | "Veterinary";
  hsnCode: string;
  taxPercentage: number;
  primaryUnit: string;
  brandNames: { name: string; customer: string }[];
}

export async function addProduct(product: Omit<Product, "id">) {
  return await addDoc(collection(db, "products"), product);
}

export async function getProducts(): Promise<Product[]> {
  const querySnapshot = await getDocs(collection(db, "products"));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Product[];
}