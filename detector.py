from datetime import datetime
from forecast import elaborate

def get_timestamp():
    return datetime.now().strftime(("%Y-%m-%d %H:%M:%S"))
# Create a handler for our read (GET) people
def forecast(formData):
   
    pred = elaborate(formData) 
    return pred
