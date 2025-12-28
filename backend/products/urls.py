from django.urls import path
from .views import (
    MallListView,
    CategoryListView,
    ProductListView,
    ProductDetailView,
    ProductBarcodeView
)

urlpatterns = [
    path('malls/', MallListView.as_view(), name='mall_list'),
    path('categories/', CategoryListView.as_view(), name='category_list'),
    path('products/', ProductListView.as_view(), name='product_list'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product_detail'),
    path('products/barcode/<str:barcode>/', ProductBarcodeView.as_view(), name='product_barcode'),
]