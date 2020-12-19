from datetime import datetime
from config import db, ma

class Lettura(db.Model):
    __tablename__ = 'lettura'
    lettura_id = db.Column(db.Integer, primary_key=True)
    autore = db.Column(db.String(128), index=True)
    libro = db.Column(db.String(128), index=True)
    dataLettura = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    commento = db.Column(db.String(512))

class LetturaSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Lettura
        sqla_session = db.session
        load_instance = True