# -*- coding: utf-8 -*-
import os
import glob
import re
import time
import psutil
import shutil
import dlib
import cv2
import csv
import math
import numpy as np
import imutils
from skimage import io
from os import listdir
from PIL import Image
import PIL
from resizeimage import resizeimage

OKBLUE = '\033[94m'
OKGREEN = '\033[92m'
ENDC = '\033[0m'

detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor(os.path.join(os.getcwd(), 'external_res', 'shape_predictor_68_face_landmarks.dat'))
N_SIZE = 120

# по определенным cv bound губ, создаем изображение 120*120
def get_normalize_mouth_bound(bound):
    mouth_center = [bound[0] + bound[2] / 2, bound[1] + bound[3] / 2]
    return (mouth_center[0] - N_SIZE / 2, mouth_center[1] - N_SIZE / 2, N_SIZE, N_SIZE, mouth_center)

def check_point_in_bound(p, b):
    return p[0] >= b[0] and p[1] >= b[1] and p[0] <= (b[0] + b[2]) and p[1] <= (b[1] + b[3]) and p[0] <= (b[0] + b[2]) and p[1] <= (b[1] + b[3])

def is_size_ok(bound):
    return not (bound[2] > N_SIZE or bound[3] > N_SIZE)

def resize_img_by_height(path, mouth_nose_distance):
    img = Image.open(path)
    w, h = img.size
    new_h = h * (N_SIZE / 2) / mouth_nose_distance
    ratio = (new_h / float(h))
    width = int((float(w) * float(ratio)))
    img = img.resize((width, int(new_h)), PIL.Image.ANTIALIAS)

    img.save(path)

def prepare_img(path, force_return=False):
    try:
        MOUTH_NOSE_DIST_MAX = N_SIZE / 2 + 3
        MOUTH_NOSE_DIST_MIN = N_SIZE / 2
        DIFF = 10
        dets = []
        dots = []

        img = io.imread(path)

        # массив лиц
        dets = detector(img, 1)

        if len(dets) == 1:
            # контрольные точки лица
            shape = predictor(img, dets[0])

            for i in range(shape.num_parts):
                dot = shape.parts().pop(i)
                dots.append([int(dot.x), int(dot.y)])

            if force_return:
                return dets, dots

            if shape.num_parts == 68:
                nose_p = dots[30]
                mouth_p = dots[62]
                mouth_nose_distance = math.sqrt(math.pow(nose_p[0] - mouth_p[0], 2) + math.pow(nose_p[1] - mouth_p[1], 2))

                if MOUTH_NOSE_DIST_MIN <= mouth_nose_distance <= MOUTH_NOSE_DIST_MAX:
                    return dets, dots
                else:
                    resize_img_by_height(path, mouth_nose_distance)
                    return prepare_img(path, True)
        return [], []
    except Exception:
        return [], []

def draw_rect_on_canvas(img, face_bound, dots):
    window_name = 'result'

    if face_bound:
        cv2.rectangle(img, (
                int(face_bound[0]),
                int(face_bound[1])
            ),(
                int(face_bound[0] + face_bound[2]),
                int(face_bound[1] + face_bound[3])
            ), (255, 255, 255), 2)

    for dot in dots:
        cv2.circle(img, (dot[0], dot[1]), 2, (0, 255, 255), -1)

    cv2.imshow(window_name, img)
    cv2.moveWindow(window_name, 0, 0)

    if not face_bound:
        cv2.waitKey(1)
    else:
        cv2.waitKey(100)



#---------------- start ----------------#

# все имена папок с видео
videos_names = listdir(os.path.join(os.getcwd(), 'res', 'videos'))

for num, dir_name in enumerate(videos_names):
    print((OKGREEN + 'Start {}' + ENDC).format(dir_name))
    if (dir_name == '.DS_Store' or dir_name == '._.DS_Store'):
        continue
    # ПУТЬ папки с кадрами
    video_folder = os.path.join(os.getcwd(), 'res', 'videos', dir_name, 'frames')
    # ПУТЬ папки с кадрами губ
    mouth_frames_folder = os.path.join(os.getcwd(), 'res', 'videos', dir_name, 'mouth_frames')
    # ПУТЬ папки с данными о кадрах губ
    mouth_frames_folder_data = os.path.join(os.getcwd(), 'res', 'videos', dir_name, 'mouth_frames', '__data')
    mouth_frames_data_file = os.path.join(mouth_frames_folder_data, 'data.csv')

    if os.path.exists(mouth_frames_folder):
        print((OKGREEN + 'Video Already cooked #{}/{} - {}' + ENDC).format(num + 1, len(videos_names), dir_name))
        continue

    # if os.path.exists(mouth_frames_folder):
    #    shutil.rmtree(mouth_frames_folder)

    os.makedirs(mouth_frames_folder)
    os.makedirs(mouth_frames_folder_data)

    # номера кадров, которые удовлетворяют всем условиям
    frames_numbers = []
    # список всех кадров
    glob_frames = glob.glob(os.path.join(video_folder, "*.jpg"))
    for frame_path in sorted(glob_frames,
            key=lambda name: int(re.search('\/thumb(\d+)\.\w+$', name).group(1))):

        frame_number = int(re.search('\/thumb(\d+)\.\w+$', frame_path).group(1))

        if frame_number % 5 == 0 or frame_number == 1:
            print(('Processing Video ' + OKBLUE + '#{}/{}' + ENDC + ' - {}, frame_number: ' + OKBLUE + '{}/{}' + ENDC).format(num + 1, len(videos_names), dir_name, frame_number, len(glob_frames)))

        dets, dots = prepare_img(frame_path)
        if len(dets) == 0 or len(dots) == 0:
            continue

        # bound губ, определенный opencv
        mouth_bound = cv2.boundingRect(np.array(dots[-20:]))
        # bound губ нормализованных для нас
        mouth_bound = get_normalize_mouth_bound(mouth_bound)
        # вырезанное изображение губ
        img = cv2.imread(frame_path, 1)
        roi = img[mouth_bound[1]:mouth_bound[1] + mouth_bound[3], mouth_bound[0]:mouth_bound[0] + mouth_bound[2]]

        cv2.imwrite(os.path.join(mouth_frames_folder, str(frame_number) + '.jpg'), roi)
        frames_numbers.append(frame_number)

    result = []
    curr = []
    for i, frame_number in enumerate(frames_numbers):
        if i == 0:
            continue
        if frame_number - frames_numbers[i - 1] > 1:
            result.append(curr)
            curr = []
        else:
            curr.append(frame_number)

    with open(mouth_frames_data_file, 'wb') as f:
        writer = csv.writer(f)
        writer.writerows(result)
    #cv2.destroyAllWindows()
