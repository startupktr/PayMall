from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Mall, Category, Product
from .serializers import MallSerializer, CategorySerializer, ProductSerializer, ProductDetailSerializer

class MallListView(generics.ListAPIView):
    """View to list all malls"""
    queryset = Mall.objects.filter(is_active=True)
    serializer_class = MallSerializer
    permission_classes = [permissions.AllowAny]

class CategoryListView(generics.ListAPIView):
    """View to list all categories"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

class ProductListView(generics.ListAPIView):
    """View to list all products with optional filtering"""
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        queryset = Product.objects.filter(is_available=True)
        
        # Filter by category if provided
        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        # Filter by mall if provided
        mall_id = self.request.query_params.get('mall')
        if mall_id:
            queryset = queryset.filter(mall_id=mall_id)
        
        # Search by name or description
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(name__icontains=search) | queryset.filter(description__icontains=search)
        
        return queryset

class ProductDetailView(generics.RetrieveAPIView):
    """View to retrieve a specific product"""
    queryset = Product.objects.all()
    serializer_class = ProductDetailSerializer
    permission_classes = [permissions.AllowAny]

class ProductBarcodeView(APIView):
    """View to retrieve a product by barcode"""
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, barcode):
        try:
            product = Product.objects.get(barcode=barcode, is_available=True)
            serializer = ProductDetailSerializer(product)
            return Response(serializer.data)
        except Product.DoesNotExist:
            return Response(
                {"error": "Product with this barcode not found or not available"}, 
                status=status.HTTP_404_NOT_FOUND
            )
