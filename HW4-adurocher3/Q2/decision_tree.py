from util import entropy, information_gain, partition_classes
import numpy as np 
import ast

class DecisionTree(object):
    def __init__(self):
        # Initializing the tree as an empty dictionary or list, as preferred
        self.tree = {}
        pass

    def learn(self, X, y):
        # TODO: Train the decision tree (self.tree) using the the sample X and labels y
        # You will have to make use of the functions in utils.py to train the tree
        
        # One possible way of implementing the tree:
        #    Each node in self.tree could be in the form of a dictionary:
        #       https://docs.python.org/2/library/stdtypes.html#mapping-types-dict
        #    For example, a non-leaf node with two children can have a 'left' key and  a 
        #    'right' key. You can add more keys which might help in classification
        #    (eg. split attribute and split value)

        # base cases (leaf)
        if len(set(y)) == 1:
            self.tree['label'] = y[0] # only one class
            return
        if len(X) == 0:
            self.tree['label'] = 0 # default leaf value
            return

        # initialization
        previous_y = y
        max_info_gain, best_split_val, best_split_attribute = -1, 0, 0
        X_left, X_right, y_left, y_right = X, [], y, []
        X, y = np.array(X), np.array(y)

        # compare split value (mean for num or random for cat) of every dimension to maximize info gain over X attributes
        for split_attribute in range(len(X[0])):
            # extract split value
            if isinstance(X[0, split_attribute], str):
                # get random unique values of the attributes
                split_val = np.random.choice(np.unique(X[:, split_attribute]), 1)[0]
            else:
                # get mean values of the instance
                split_val = np.mean(X[:, split_attribute])

            # new split trial
            X_left_, X_right_, y_left_, y_right_ = partition_classes(X, y, split_attribute, split_val)

            # compute split information gain
            current_y = [list(y_left_), list(y_right_)]
            info_gain = information_gain(previous_y, current_y)

            # save best split parameters
            if info_gain > max_info_gain:
                max_info_gain = info_gain
                best_split_val = split_val
                best_split_attribute = split_attribute
                X_left, X_right, y_left, y_right = X_left_, X_right_, y_left_, y_right_

        # check split choosen
        if len(y_left) == len(y) or len(y_right) == len(y):
            # get maximum occurence of y class as label
            count_y = np.bincount(y)
            self.tree['label'] = np.argmax(count)
            return


        # recursively call on right and left child
        self.tree['left'], self.tree['right'] = DecisionTree(), DecisionTree()
        self.tree['split_val'], self.tree['split_attribute'] = best_split_val, best_split_attribute
        self.tree['left'].learn(X_left, y_left)
        self.tree['right'].learn(X_right, y_right)


    def classify(self, record):
        # TODO: classify the record using self.tree and return the predicted label
        node = self.tree
        while 'label' not in node:
            # browse entire tree until reach label leaf

            if isinstance(node['split_val'], str):
                # categorical split value
                if record[node['split_attribute']] == node['split_val']:
                    node = node['left'].tree
                else:
                    node = node['right'].tree
            else:
                # numerical split value
                if record[node['split_attribute']] <= node['split_val']:
                    node = node['left'].tree
                else:
                    node = node['right'].tree

        return node['label']
