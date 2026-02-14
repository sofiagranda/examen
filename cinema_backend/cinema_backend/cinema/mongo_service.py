from __future__ import annotations
import logging
from typing import Optional, Tuple
from pymongo import MongoClient, ASCENDING
from pymongo.collection import Collection
from django.conf import settings
from datetime import datetime

logger = logging.getLogger(__name__)

_client: Optional[MongoClient] = None

def get_client() -> MongoClient:
    global _client
    if _client is None:
        uri = getattr(settings, "MONGO_URI", "mongodb://127.0.0.1:27017")
        _client = MongoClient(uri, serverSelectionTimeoutMS=3000)
        try:
            _client.admin.command("ping")
            logger.info("Conectado a MongoDB")
        except Exception as e:
            logger.warning("No se pudo conectar a MongoDB: %s", e)
    return _client

def get_db():
    client = get_client()
    db_name = getattr(settings, "MONGO_DB", "cinema_logs")
    return client[db_name]

def get_collections() -> Tuple[Collection, Collection]:
    db = get_db()
    movie_catalog = db.get_collection("movie_catalog")
    reservation_events = db.get_collection("reservation_events")
    return movie_catalog, reservation_events

def ensure_indexes():
    _, reservation_events = get_collections()
    try:
        reservation_events.create_index([("reservation_id", ASCENDING)], name="idx_reservation_id", background=True)
        logger.info("Índice idx_reservation_id verificado/creado.")
    except Exception as e:
        logger.warning("No se pudo crear índice en reservation_events: %s", e)

def register_reservation_event(
    reservation_id: int,
    event_type: str,
    source: str,
    note: str,
    created_at: Optional[datetime] = None,
):
    try:
        _, reservation_events = get_collections()
        doc = {
            "reservation_id": int(reservation_id),
            "event_type": event_type,   
            "source": source,           
            "note": note,
            "created_at": created_at or datetime.utcnow(),
        }
        reservation_events.insert_one(doc)
        logger.info("Evento de reserva registrado en Mongo: %s", doc)
    except Exception as e:
        # No impedir el POST de reserva en SQL si Mongo falla
        logger.warning("Fallo registrando evento en Mongo: %s", e)