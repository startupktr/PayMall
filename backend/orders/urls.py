from django.urls import path
from .views import (
    CartView,
    CartItemAddView,
    CartItemUpdateView,
    OrderListView,
    OrderDetailView,
    OrderCreateView,
    OrderInvoiceView,
    CancelOrderView,
)

urlpatterns = [
    # Cart endpoints
    path('cart/', CartView.as_view(), name='cart'),
    path('cart/add/', CartItemAddView.as_view(), name='cart_add_item'),
    path('cart/items/<int:pk>/', CartItemUpdateView.as_view(), name='cart_update_item'),
    
    # Order endpoints
    path('orders/', OrderListView.as_view(), name='order_list'),
    path('orders/<int:pk>/', OrderDetailView.as_view(), name='order_detail'),
    path('orders/create/', OrderCreateView.as_view(), name='order_create'),
    path("orders/<int:pk>/invoice/", OrderInvoiceView.as_view()),
    path("orders/<int:pk>/cancel/", CancelOrderView.as_view()),

]