from rest_framework import routers

from cinema.movie_catalog_views import movie_catalog_list_create, movie_catalog_types_detail
from cinema.reservation_events_views import reservations_events_detail, reservations_events_list_create
from .views import *

router = routers.DefaultRouter()
router.register('shows', ShowViewSet)
router.register('reservations', ReservationViewSet)
router.register("movie-catalog", movie_catalog_list_create),
router.register("movie-catalog-types", movie_catalog_types_detail),
router.register("reservations-events", reservations_events_list_create),
router.register("reservations-events-services", reservations_events_detail),

urlpatterns = router.urls