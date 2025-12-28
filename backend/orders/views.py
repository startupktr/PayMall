from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.utils import timezone
from django.shortcuts import get_object_or_404
import uuid

from products.models import Product
from .models import Cart, CartItem, Order, OrderItem
from .serializers import (
    CartSerializer, 
    CartItemSerializer, 
    OrderSerializer, 
    OrderDetailSerializer,
    OrderCreateSerializer
)

class CartView(APIView):
    """View to retrieve and manage the user's cart"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get the current user's cart"""
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)
    
    def delete(self, request):
        """Clear the user's cart"""
        cart, created = Cart.objects.get_or_create(user=request.user)
        cart.items.all().delete()
        cart.delete()
        return Response({"message": "Cart cleared successfully"}, status=status.HTTP_200_OK)

class CartItemAddView(APIView):
    """View to add items to the cart"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Add a product to the cart"""
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))
        
        if not product_id:
            return Response({"error": "Product ID is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            product = Product.objects.get(id=product_id, is_available=True)
        except Product.DoesNotExist:
            return Response({"error": "Product not found or not available"}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if quantity is valid
        if quantity <= 0:
            return Response({"error": "Quantity must be positive"}, status=status.HTTP_400_BAD_REQUEST)
        
        if product.stock_quantity < quantity:
            return Response({"error": "Requested quantity exceeds available stock"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get or create cart
        cart, created = Cart.objects.get_or_create(user=request.user)
        
        # Check if item already exists in cart
        try:
            cart_item = CartItem.objects.get(cart=cart, product=product)
            cart_item.quantity += quantity
            cart_item.save()
            serializer = CartItemSerializer(cart_item)
            return Response(serializer.data)
        except CartItem.DoesNotExist:
            cart_item = CartItem.objects.create(cart=cart, product=product, quantity=quantity)
            serializer = CartItemSerializer(cart_item)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

class CartItemUpdateView(APIView):
    """View to update or delete cart items"""
    permission_classes = [permissions.IsAuthenticated]
    
    def put(self, request, pk):
        """Update item quantity"""
        quantity = request.data.get('quantity')
        
        if not quantity:
            return Response({"error": "Quantity is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        quantity = int(quantity)
        if quantity <= 0:
            return Response({"error": "Quantity must be positive"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            cart = Cart.objects.get(user=request.user)
            cart_item = CartItem.objects.get(pk=pk, cart=cart)
        except (Cart.DoesNotExist, CartItem.DoesNotExist):
            return Response({"error": "Cart item not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Check stock
        if cart_item.product.stock_quantity < quantity:
            return Response({"error": "Requested quantity exceeds available stock"}, status=status.HTTP_400_BAD_REQUEST)
        
        cart_item.quantity = quantity
        cart_item.save()
        serializer = CartItemSerializer(cart_item)
        return Response(serializer.data)
    
    def delete(self, request, pk):
        """Remove item from cart"""
        try:
            cart = Cart.objects.get(user=request.user)
            cart_item = CartItem.objects.get(pk=pk, cart=cart)
        except (Cart.DoesNotExist, CartItem.DoesNotExist):
            return Response({"error": "Cart item not found"}, status=status.HTTP_404_NOT_FOUND)
        
        cart_item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class OrderListView(generics.ListAPIView):
    """View to list all orders for a user"""
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')

class OrderDetailView(generics.RetrieveAPIView):
    """View to get details of a specific order"""
    serializer_class = OrderDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

class OrderCreateView(APIView):
    """View to create a new order from the cart"""
    permission_classes = [permissions.IsAuthenticated]
    
    @transaction.atomic
    def post(self, request):
        try:
            cart = Cart.objects.get(user=request.user)
        except Cart.DoesNotExist:
            return Response({"error": "Cart not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if cart is empty
        if not cart.items.exists():
            return Response({"error": "Cannot create order with empty cart"}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = OrderCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate order number
        order_number = f"ORD-{uuid.uuid4().hex[:8].upper()}"
        
        # Create order
        order = Order.objects.create(
            user=request.user,
            mall=cart.items.first().product.mall,  # Assuming all items are from the same mall
            order_number=order_number,
            payment_method=serializer.validated_data['payment_method'],
            subtotal=cart.subtotal,
            tax=cart.tax_amount,
            total=cart.total_amount
        )
        
        # Create order items
        for cart_item in cart.items.all():
            # Decrease product stock
            product = cart_item.product
            if product.stock_quantity < cart_item.quantity:
                # Rollback transaction if stock is insufficient
                transaction.set_rollback(True)
                return Response(
                    {"error": f"Insufficient stock for {product.name}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            product.stock_quantity -= cart_item.quantity
            product.save()
            
            # Create order item
            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=product.name,
                product_price=product.price,
                product_barcode=product.barcode,
                quantity=cart_item.quantity,
                total_price=cart_item.total_price
            )
        
        # Clear the cart
        cart.items.all().delete()
        
        # Return the created order
        order_detail = OrderDetailSerializer(order)
        return Response(order_detail.data, status=status.HTTP_201_CREATED)
