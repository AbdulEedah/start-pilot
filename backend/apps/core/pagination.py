"""
Custom pagination classes for the StartPilot REST API.
"""
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class StandardResultsSetPagination(PageNumberPagination):
    """
    Default paginator: page_size=20, client may override up to 100.
    Returns a consistent envelope with count, next, previous, and results.
    """

    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100
    page_query_param = "page"

    def get_paginated_response(self, data):
        """Return paginated response with metadata envelope."""
        return Response(
            {
                "count": self.page.paginator.count,
                "total_pages": self.page.paginator.num_pages,
                "next": self.get_next_link(),
                "previous": self.get_previous_link(),
                "results": data,
            }
        )

    def get_paginated_response_schema(self, schema):
        """Document the paginated response shape for drf-spectacular."""
        return {
            "type": "object",
            "properties": {
                "count": {"type": "integer", "example": 42},
                "total_pages": {"type": "integer", "example": 3},
                "next": {"type": "string", "nullable": True},
                "previous": {"type": "string", "nullable": True},
                "results": schema,
            },
            "required": ["count", "total_pages", "next", "previous", "results"],
        }
