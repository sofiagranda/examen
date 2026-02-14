from django.contrib import admin

from cinema.models import Reservation, Show


admin.site.register(Show)
admin.site.register(Reservation)
