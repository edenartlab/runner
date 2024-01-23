import threading

from abraham import *
from runner import *


def main():
    thread1 = threading.Thread(target=run_comfy_heartbeat)
    #thread2 = threading.Thread(target=run_video_heartbeat)
    thread3 = threading.Thread(target=run_abraham_loop)

    thread1.start()
    #thread2.start()
    thread3.start()

    thread1.join()
    #thread2.join()
    thread3.join()
    


if __name__ == "__main__":
    main()