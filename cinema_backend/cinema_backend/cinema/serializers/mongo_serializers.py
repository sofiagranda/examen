from rest_framework import serializers

class MovieCatalogSerializer(serializers.Serializer):
    movie_title = serializers.CharField(max_length=120)
    genre = serializers.CharField(required=False, allow_blank=True)
    duration_min = serializers.IntegerField(required=False)
    rating = serializers.CharField(required=False, allow_blank=True)
    is_active = serializers.BooleanField(default=True)

class ReservationsEventsSerializer(serializers.Serializer):
    vehiculo_id = serializers.IntegerField()        # ID de Vehiculo (Postgres)
    service_type_id = serializers.CharField()       # ObjectId (string) de service_types
    date = serializers.DateField(required=False)    # Ej: 2026-02-04
    kilometers = serializers.IntegerField(required=False)
    cost = serializers.FloatField(required=False)
    notes = serializers.CharField(required=False, allow_blank=True)