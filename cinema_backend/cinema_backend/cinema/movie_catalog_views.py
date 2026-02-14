from django import db
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from bson import ObjectId
from bson.errors import InvalidId
from cinema.serializers.mongo_serializers import MovieCatalogSerializer

col = db["service_types"]

def fix_id(doc):
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    return doc

def oid_or_none(id_str: str):
    try:
        return ObjectId(id_str)
    except InvalidId:
        return None

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def movie_catalog_list_create(request):
    if request.method == "GET":
        q = dict(request.query_params)
        docs = [fix_id(d) for d in col.find(q)]
        return Response(docs)

    serializer = MovieCatalogSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    res = col.insert_one(serializer.validated_data)
    doc = col.find_one({"_id": res.inserted_id})
    return Response(fix_id(doc), status=status.HTTP_201_CREATED)

@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def movie_catalog_types_detail(request, id: str):
    _id = oid_or_none(id)
    if _id is None:
        return Response({"detail": "id inválido"}, status=status.HTTP_400_BAD_REQUEST)

    if request.method == "GET":
        doc = col.find_one({"_id": _id})
        if not doc:
            return Response({"detail": "No encontrado"}, status=status.HTTP_404_NOT_FOUND)
        return Response(fix_id(doc))

    if request.method in ["PUT", "PATCH"]:
        serializer = MovieCatalogSerializer(data=request.data, partial=(request.method == "PATCH"))
        serializer.is_valid(raise_exception=True)

        col.update_one({"_id": _id}, {"$set": serializer.validated_data})
        doc = col.find_one({"_id": _id})
        if not doc:
            return Response({"detail": "No encontrado"}, status=status.HTTP_404_NOT_FOUND)
        return Response(fix_id(doc))

    res = col.delete_one({"_id": _id})
    if res.deleted_count == 0:
        return Response({"detail": "No encontrado"}, status=status.HTTP_404_NOT_FOUND)
    return Response(status=status.HTTP_204_NO_CONTENT)