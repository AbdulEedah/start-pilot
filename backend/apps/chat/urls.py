"""URL patterns for the chat app."""
from django.urls import path

from .views import ConversationListView, MessageListView, SendMessageView

app_name = "chat"

urlpatterns = [
    path("conversations/", ConversationListView.as_view(), name="conversations"),
    path("messages/", SendMessageView.as_view(), name="send-message"),
    path("messages/history/", MessageListView.as_view(), name="message-list"),
]
