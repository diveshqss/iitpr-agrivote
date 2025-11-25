from flask import Blueprint, jsonify

auth_bp = Blueprint("auth", __name__)

@auth_bp.get("/test")
def test_auth():
    return jsonify({"message": "auth ok"})