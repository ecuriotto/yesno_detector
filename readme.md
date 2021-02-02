#yes no detector. Project for recognizing basic voice commands (yes no)

Constituted by a 
* webservice that receives a wav file and decode it into a result (yes / no / other)
* Python classes to preprocess the wav file
* Python deep neural network model 

To execute the app: python app.py

For Docker:

sudo docker build -t yesno:latest .
sudo docker run -d -p 5000:5000 yesno

Kube:
kubectl create -f kb8/yesno-deploy.yaml
kubectl create -f kb8/yesno-service.yaml