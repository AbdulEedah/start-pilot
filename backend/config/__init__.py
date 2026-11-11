"""
Config package init – ensures the Celery app is loaded when Django starts
so that shared_task decorators work correctly.
"""
import copy
from .celery import app as celery_app

# Python 3.14+ compatibility fix for Django template Context copying
try:
    from django.template import context as _dj_context
    _dummy = _dj_context.BaseContext()
    copy.copy(_dummy)
except AttributeError:
    def _patched_basecontext_copy(self):
        duplicate = _dj_context.BaseContext()
        duplicate.__class__ = self.__class__
        duplicate.__dict__ = copy.copy(self.__dict__)
        duplicate.dicts = self.dicts[:]
        return duplicate

    _dj_context.BaseContext.__copy__ = _patched_basecontext_copy
except Exception:
    pass

__all__ = ("celery_app",)
