from typing import List
import numpy as np
import matplotlib.pyplot as plt
import h2o


def countItems(data: List[float]) -> int:
    return len(data)


def mean(data: List[float]) -> float:
    return sum(data)/len(data)


def _medianOdd(data: List[float]) -> float:
    return sorted(data)[len(data)//2]


def _medianEven(data: List[float]) -> float:
    sortedData = sorted(data)
    hiMidpoint = len(data)//2
    return (sortedData[hiMidpoint - 1] + sortedData[hiMidpoint]) / 2


def median(data: List[float]) -> float:
    return _medianEven(data) if len(data) % 2 == 0 else _medianOdd(data)


def quantile(data: List[float], percentile: float) -> float:
    percentileIndex = int(percentile * len(data))
    return sorted(data)[percentileIndex]


def main():
    data = [100, 49, 45, 89, 34, 67]
    h2o.init()
    from h2o.estimators.glm import H2OGeneralizedLinearEstimator

    # import the prostate dataset
    prostate = h2o.import_file("https://h2o-public-test-data.s3.amazonaws.com/smalldata/prostate/prostate.csv")

    # convert columns to factors
    prostate['CAPSULE'] = prostate['CAPSULE'].asfactor()
    prostate['RACE'] = prostate['RACE'].asfactor()
    prostate['DCAPS'] = prostate['DCAPS'].asfactor()
    prostate['DPROS'] = prostate['DPROS'].asfactor()

    # set the predictor and response columns
    predictors = ["AGE", "RACE", "VOL", "GLEASON"]
    response_col = "CAPSULE"

    # split into train and testing sets
    train, test = prostate.split_frame(ratios=[0.8], seed=1234)

    # set GLM modeling parameters
    # and initialize model training
    glm_model = H2OGeneralizedLinearEstimator(family="binomial",
                                              lambda_=0,
                                              compute_p_values=True)
    glm_model.train(predictors, response_col, training_frame=prostate)

    # predict using the model and the testing dataset
    predict = glm_model.predict(test)

    # View a summary of the prediction
    print(predict.head())


if __name__ == '__main__':
    main()
