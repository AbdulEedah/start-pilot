"""
Django signals for the accounts app.

Currently no automatic post-save signals are required here;
email dispatch is handled explicitly in the service layer to keep
the control flow predictable and testable.
"""
