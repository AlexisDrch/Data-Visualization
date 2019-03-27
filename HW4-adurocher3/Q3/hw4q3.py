## Data and Visual Analytics - Homework 4
## Georgia Institute of Technology
## Applying ML algorithms to detect eye state

import numpy as np
import pandas as pd
import time

from sklearn.model_selection import cross_val_score, GridSearchCV, cross_validate, train_test_split
from sklearn.metrics import accuracy_score, classification_report
from sklearn.svm import SVC
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler, normalize
from sklearn.decomposition import PCA

######################################### Reading and Splitting the Data ###############################################
# XXX
# TODO: Read in all the data. Replace the 'xxx' with the path to the data set.
# XXX
data = pd.read_csv('eeg_dataset.csv')

# Separate out the x_data and y_data.
x_data = data.loc[:, data.columns != "y"]
y_data = data.loc[:, "y"]

# The random state to use while splitting the data.
random_state = 100

# XXX
# TODO: Split 70% of the data into training and 30% into test sets. Call them x_train, x_test, y_train and y_test.
# Use the train_test_split method in sklearn with the parameter 'shuffle' set to true and the 'random_state' set to 100.
x_train, x_test, y_train, y_test = train_test_split(x_data, y_data, test_size=0.33, shuffle=True, random_state=100)
# XXX


# ############################################### Linear Regression ###################################################
# XXX
# TODO: Create a LinearRegression classifier and train it.
clf_lr = LinearRegression()
clf_lr.fit(x_train, y_train)
# XXX

# XXX
# Note: Round the output values greater than or equal to 0.5 to 1 and those less than 0.5 to 0. You can use y_predict.round() or any other method.
# TODO: Test its accuracy (on the training set) using the accuracy_score method.
y_train_pred = clf_lr.predict(x_train).round()
training_accuracy = accuracy_score(y_train, y_train_pred, normalize=True)
# TODO: Test its accuracy (on the testing set) using the accuracy_score method.
y_test_pred = clf_lr.predict(x_test).round()
testing_accuracy = accuracy_score(y_test, y_test_pred, normalize=True)
print(f'Linear Reg, accuracy training: {training_accuracy} / testing: {testing_accuracy}')
# XXX


# ############################################### Random Forest Classifier ##############################################
# XXX
# TODO: Create a RandomForestClassifier and train it.
clf_rf = RandomForestClassifier(n_estimators=10)
clf_rf.fit(x_train, y_train)
# XXX


# XXX
# TODO: Test its accuracy on the training set using the accuracy_score method.
y_train_pred = clf_rf.predict(x_train)
training_accuracy = accuracy_score(y_train, y_train_pred, normalize=True)
# TODO: Test its accuracy on the test set using the accuracy_score method.
y_test_pred = clf_rf.predict(x_test)
testing_accuracy = accuracy_score(y_test, y_test_pred, normalize=True)
print(f'Random Forest, accuracy training: {training_accuracy} / testing: {testing_accuracy}')
# XXX


# XXX
# TODO: Determine the feature importance as evaluated by the Random Forest Classifier.
#       Sort them in the descending order and print the feature numbers. The report the most important and the least important feature.
#       Mention the features with the exact names, e.g. X11, X1, etc.
#       Hint: There is a direct function available in sklearn to achieve this. Also checkout argsort() function in Python.
feature_importances = clf_rf.feature_importances_
idx_feature_importances = np.argsort(feature_importances)
most_important, least_important = idx_feature_importances[-1], idx_feature_importances[0]
print(f'Most important feature is {data.columns[most_important]}, least is {data.columns[least_important]}')
# XXX


# XXX
# TODO: Tune the hyper-parameters 'n_estimators' and 'max_depth'.
#       Print the best params, using .best_params_, and print the best score, using .best_score_.
param_grid = [
  {'n_estimators': [10, 100, 200],
   'max_depth': [20, 40, 60, 80]},
 ]
grid = GridSearchCV(clf_rf, param_grid, cv=10)
grid.fit(x_train, y_train)
print(grid.best_score_, grid.best_params_)
# XXX


# ############################################ Support Vector Machine ###################################################
# XXX
# TODO: Pre-process the data to standardize or normalize it, otherwise the grid search will take much longer
# TODO: Create a SVC classifier and train it.
scaler = StandardScaler()
x_train_ = scaler.fit_transform(x_train)
x_test_ = scaler.transform(x_test)
clf_svc = SVC(gamma = 'auto')
clf_svc.fit(x_train_, y_train)
# XXX


# XXX
# TODO: Test its accuracy on the training set using the accuracy_score method.
y_train_pred = clf_svc.predict(x_train_)
training_accuracy = accuracy_score(y_train, y_train_pred, normalize=True)
# TODO: Test its accuracy on the test set using the accuracy_score method.
y_test_pred = clf_svc.predict(x_test_)
testing_accuracy = accuracy_score(y_test, y_test_pred, normalize=True)
print(f'SVC, accuracy training: {training_accuracy} / testing: {testing_accuracy}')
# XXX


# XXX
# TODO: Tune the hyper-parameters 'C' and 'kernel' (use rbf and linear).
#       Print the best params, using .best_params_, and print the best score, using .best_score_.
param_grid = [
  {'C': [0.001, 0.01, 0.1],
   'kernel': ['linear', 'rbf']},
 ]
grid = GridSearchCV(clf_svc, param_grid, cv=10)
grid.fit(x_train_, y_train)
print(grid.best_score_, grid.best_params_)

cv_results_ = grid.cv_results_
print(f'{cv_results_}')
# XXX


# ######################################### Principal Component Analysis #################################################
# XXX
# TODO: Perform dimensionality reduction of the data using PCA.
#       Set parameters n_component to 10 and svd_solver to 'full'. Keep other parameters at their default value.
#       Print the following arrays:
#       - Percentage of variance explained by each of the selected components
#       - The singular values corresponding to each of the selected components.
pca = PCA(n_components=10, svd_solver='full')
explained_variances = pca.explained_variance_ratio_
singular_values = pca.singular_values_

print(f'explained variance {explained_variances}')
print(f'singular values {singular_values}')
# XXX


