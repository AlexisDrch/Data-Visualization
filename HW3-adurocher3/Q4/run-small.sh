hadoop jar ./target/q1-1.0.jar edu.gatech.cse6242.Q4 ./small.tsv ./data/q4outputsm
hadoop fs -getmerge ./data/q4outputsm/ q4outputsm.tsv
hadoop fs -rm -r ./data/q4outputsm
