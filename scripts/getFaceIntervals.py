import os
import glob
import re
import time
import psutil
import dlib
import cv2
import numpy as np
import imutils
from skimage import io
from PIL import Image, ImageDraw
detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor(os.path.join(os.getcwd(), 'external_res', 'shape_predictor_68_face_landmarks.dat'))

def draw_rect_on_canvas(img, face_bound, dots):
    window_name = 'result'

    if face_bound:
        cv2.rectangle(img, (
                int(face_bound.left()),
                int(face_bound.top())
            ),(
                int(face_bound.right()),
                int(face_bound.bottom())
            ), (255, 255, 255), 2)

        for dot in dots:
            cv2.circle(img, (int(dot.x), int(dot.y)), 2, (0, 255, 255), -1)

    cv2.imshow(window_name, img)
    cv2.moveWindow(window_name, 0, 0)

    if not face_bound:
        cv2.waitKey(10)
    else:
        cv2.waitKey(300)


#TODO цикл по всем папкам
video_folder = os.path.join(os.getcwd(), 'res', 'videos', '0Di38ACxCFI', 'frames')

k = 1
for file_path in sorted(glob.glob(os.path.join(video_folder, "*.jpg")),
        key=lambda name: int(re.search('\/thumb(\d+)\.\w+$', name).group(1))):
    print("Processing Frame {}".format(k))
    k += 1

    if (k < 500):
        continue

    img = io.imread(file_path)
    dets = detector(img, 1)

    dots = []
    if len(dets) == 1:
        shape = predictor(img, dets[0])
        for i in range(shape.num_parts):
            dots.append(shape.parts().pop(i))


    print("Faces count {}".format(len(dets)))
    img = cv2.imread(file_path, 1)

    # TODO определять есть ли одно лицо, есть ли норм точки, запомнить место губ и следить за местом
    # сделать определение интервала где есть норм лицо и сохранять рядом с видео в файле
    draw_rect_on_canvas(img, len(dets) == 1 and dets[0], dots)

cv2.destroyAllWindows()