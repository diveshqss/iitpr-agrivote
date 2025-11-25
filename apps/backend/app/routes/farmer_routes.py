from flask import Blueprint, jsonify

farmer_bp = Blueprint("farmer", __name__)

@farmer_bp.get("/test")
def test_farmer():
    return jsonify({"message": "farmer ok"})