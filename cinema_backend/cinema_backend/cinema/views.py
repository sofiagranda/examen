from rest_framework.authtoken.models import Token
from rest_framework import viewsets, status
from rest_framework.response import Response
from cinema.serializers import reservation_serializer
from cinema.serializers.Show_serializer import ShowSerializer
from .models import Show, Reservation
# from .mongo_service import registrar_evento
from rest_framework.permissions import AllowAny
from rest_framework.authtoken.views import ObtainAuthToken
from django.utils import timezone
from .mongo_service import register_reservation_event


class ShowViewSet(viewsets.ModelViewSet):
    queryset = Show.objects.all().order_by("id")
    serializer_class = ShowSerializer
    permission_classes = [AllowAny]
    search_fields = ["movie_title"]

class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all().order_by("id")
    serializer_class = reservation_serializer.ReservationSerializer
    permission_classes = [AllowAny]
    search_fields = ["show"]

    # def perform_create(self, serializer):
    #     instance = serializer.save()
    #     registrar_evento(instance.id, "CREATED", f"Reserva para {instance.customer_name}")
    
class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
        context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'is_staff': user.is_staff,
            'email': user.email
        })
        
        

class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all().order_by("id")
    serializer_class = reservation_serializer.ReservationSerializer
    permission_classes = [AllowAny]
    search_fields = ["show"]

    def perform_create(self, serializer):
        instance = serializer.save()
        register_reservation_event(
            reservation_id=instance.id,
            event_type="CREATED",
            source="WEB",
            note=f"Reserva para {instance.customer_name}",
            created_at=timezone.now().astimezone().replace(tzinfo=None) 
        )