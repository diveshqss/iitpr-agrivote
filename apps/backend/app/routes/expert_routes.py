from flask import Blueprint, jsonify

expert_bp = Blueprint("expert", __name__)

@expert_bp.get("/test")
def test_expert():
    return jsonify({"message": "expert ok"})