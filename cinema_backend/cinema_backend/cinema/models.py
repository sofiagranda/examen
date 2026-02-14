# --- models.py (Tablas SQL [cite: 17, 18]) ---
from django.db import models

class Show(models.Model):
    movie_title = models.CharField(max_length=120)
    room = models.CharField(max_length=20)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    available_seats = models.IntegerField()

class Reservation(models.Model):
    show = models.ForeignKey(Show, on_delete=models.CASCADE)
    customer_name = models.CharField(max_length=120)
    seats = models.IntegerField()
    status = models.CharField(max_length=20, default='RESERVED') # RESERVED, CONFIRMED, CANCELLED
    created_at = models.DateTimeField(auto_now_add=True)



















# db.reservation_events.createIndex({ "reservation_id": 1 }); # Índice obligatorio [cite: 69]



# # Crear estructura de carpetas [cite: 99]
# cd ~ && mkdir -p examen/cine/{backend,frontend,movil,docs}
# cd examen/cine

# # Crear archivos y permisos (Sticky Bit [cite: 141, 142])
# touch docs/evidencia.txt
# date >> docs/evidencia.txt
# mkdir shared_cine && chmod 1777 shared_cine

# # Búsqueda de palabras (Grep [cite: 129, 131])
# grep -n "reservations" docs/cine_comandos.txt

