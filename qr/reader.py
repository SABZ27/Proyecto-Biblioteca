import cv2
from pyzbar.pyzbar import decode
import time  # Importamos la librería time
import http.client
import json

def leer_qr_con_delay():
    cap = cv2.VideoCapture(0)
    delay_entre_lecturas = 5  # Segundos de espera entre lecturas
    ultima_lectura = 0  # Tiempo de la última lectura

    while True:
        _, frame = cap.read()
        decodificados = decode(frame)
        tiempo_actual = time.time()

        # Solo procesa si ha pasado el tiempo de delay
        if decodificados and (tiempo_actual - ultima_lectura) > delay_entre_lecturas:
            for codigo in decodificados:
                datos = codigo.data.decode('utf-8')

                conn = http.client.HTTPConnection("127.0.0.1", 8000)
                payload = json.dumps({
                    "dni": datos
                })
                headers = {
                    'Content-Type': 'application/json'
                }
                conn.request("POST", "/api/library-access", payload, headers)
                res = conn.getresponse()
                data = res.read()

                if res.status != 200:
                    print(f"Error: {res.status} - {res.reason}")
                    print(data.decode("utf-8"))
                    continue

                # Si la respuesta es exitosa, imprime el mensaje

                print(data.decode("utf-8"))

                print(f"\nDatos leídos: {str(int(datos))}")

                print(f"Próxima lectura en {delay_entre_lecturas} segundos...")

                # Dibuja el rectángulo y muestra los datos en la ventana
                (x, y, w, h) = codigo.rect
                cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
                cv2.putText(frame, datos, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

                ultima_lectura = tiempo_actual  # Actualiza el tiempo de última lectura

        cv2.imshow("Lector QR (Presiona 'Q' para salir)", frame)

        # Salir con la tecla 'q'
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    leer_qr_con_delay()

