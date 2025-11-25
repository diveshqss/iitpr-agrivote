from flask import Blueprint, jsonify

moderator_bp = Blueprint("moderator", __name__)

@moderator_bp.get("/test")
def test_mod():
    return jsonify({"message": "moderator ok"})