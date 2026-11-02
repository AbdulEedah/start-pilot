"""
Views for the notifications app.

Endpoints:
    GET   /api/v1/notifications/         – List in-app notifications for the user.
    PATCH /api/v1/notifications/{id}/read/ – Mark a notification as read.
"""
import logging

from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.pagination import StandardResultsSetPagination

from .models import Notification
from .serializers import NotificationSerializer

logger = logging.getLogger(__name__)


class NotificationListView(APIView):
    """
    GET /api/v1/notifications/

    Returns all in-app notifications for the authenticated user,
    ordered by most recent.  Supports ?is_read=false filtering.
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        parameters=[
            OpenApiParameter(
                "is_read",
                bool,
                description="Filter by read status. Pass 'false' to see only unread.",
            ),
        ],
        responses={200: NotificationSerializer(many=True)},
        summary="List in-app notifications",
    )
    def get(self, request, *args, **kwargs):
        """Return paginated in-app notifications for the user."""
        queryset = Notification.objects.filter(user=request.user, type="in_app")

        # Optional filtering by read status
        is_read_param = request.query_params.get("is_read")
        if is_read_param is not None:
            is_read = is_read_param.lower() in ("true", "1", "yes")
            queryset = queryset.filter(is_read=is_read)

        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(queryset, request)
        return paginator.get_paginated_response(
            NotificationSerializer(page, many=True).data
        )


class MarkNotificationReadView(APIView):
    """
    PATCH /api/v1/notifications/{notification_id}/read/

    Mark the specified in-app notification as read.
    Only the owner of the notification may mark it.
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=None,
        responses={200: NotificationSerializer},
        summary="Mark a notification as read",
    )
    def patch(self, request, notification_id: int, *args, **kwargs):
        """Set is_read=True on the notification."""
        try:
            notification = Notification.objects.get(
                pk=notification_id,
                user=request.user,
                type="in_app",
            )
        except Notification.DoesNotExist:
            return Response(
                {"detail": "Notification not found."}, status=status.HTTP_404_NOT_FOUND
            )

        if not notification.is_read:
            notification.is_read = True
            notification.save(update_fields=["is_read"])

        return Response(NotificationSerializer(notification).data, status=status.HTTP_200_OK)
