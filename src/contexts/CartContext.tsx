import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { Product } from '../lib/api'
import toast from 'react-hot-toast'

interface CartItem {
  id: number
  product: Product
  quantity: number
}

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity?: number } }
  | { type: 'REMOVE_ITEM'; payload: { id: number } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: number; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartState }

interface CartContextType {
  state: CartState
  addItem: (product: Product, quantity?: number) => void
  removeItem: (id: number) => void
  updateQuantity: (id: number, quantity: number) => void
  clearCart: () => void
  isInCart: (productId: number) => boolean
  getItemQuantity: (productId: number) => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, quantity = 1 } = action.payload
      const existingItem = state.items.find(item => item.product.id === product.id)
      
      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
        
        const newState = {
          ...state,
          items: updatedItems,
          total: updatedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
          itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
        }
        
        localStorage.setItem('cart', JSON.stringify(newState))
        return newState
      } else {
        const newItem: CartItem = {
          id: Date.now(),
          product,
          quantity
        }
        
        const updatedItems = [...state.items, newItem]
        const newState = {
          ...state,
          items: updatedItems,
          total: updatedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
          itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
        }
        
        localStorage.setItem('cart', JSON.stringify(newState))
        return newState
      }
    }
    
    case 'REMOVE_ITEM': {
      const { id } = action.payload
      const updatedItems = state.items.filter(item => item.id !== id)
      
      const newState = {
        ...state,
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
        itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
      }
      
      localStorage.setItem('cart', JSON.stringify(newState))
      return newState
    }
    
    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload
      const updatedItems = state.items.map(item =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
      )
      
      const newState = {
        ...state,
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
        itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
      }
      
      localStorage.setItem('cart', JSON.stringify(newState))
      return newState
    }
    
    case 'CLEAR_CART': {
      const newState = {
        ...state,
        items: [],
        total: 0,
        itemCount: 0
      }
      
      localStorage.removeItem('cart')
      return newState
    }
    
    case 'LOAD_CART': {
      return action.payload
    }
    
    default:
      return state
  }
}

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        dispatch({ type: 'LOAD_CART', payload: parsedCart })
      } catch (error) {
        console.error('Erro ao carregar carrinho:', error)
        localStorage.removeItem('cart')
      }
    }
  }, [])

  const addItem = (product: Product, quantity: number = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, quantity } })
    toast.success(`${product.name} adicionado ao carrinho!`)
  }

  const removeItem = (id: number) => {
    const item = state.items.find(item => item.id === id)
    if (item) {
      dispatch({ type: 'REMOVE_ITEM', payload: { id } })
      toast.success(`${item.product.name} removido do carrinho!`)
    }
  }

  const updateQuantity = (id: number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
    toast.success('Carrinho limpo!')
  }

  const isInCart = (productId: number) => {
    return state.items.some(item => item.product.id === productId)
  }

  const getItemQuantity = (productId: number) => {
    const item = state.items.find(item => item.product.id === productId)
    return item ? item.quantity : 0
  }

  const value: CartContextType = {
    state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart deve ser usado dentro de um CartProvider')
  }
  return context
} 