package edu.gatech.cse6242;
import java.io.IOException;
import java.util.StringTokenizer;

import org.apache.hadoop.fs.Path;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.io.*;
import org.apache.hadoop.mapreduce.*;
import org.apache.hadoop.util.*;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;

public class Q1 {

 public static class TokenizerMapper
       extends Mapper<Object, Text, Text, IntWritable>{

    private IntWritable weight = new IntWritable();
    private Text word = new Text();

    public void map(Object key, Text value, Context context
	            ) throws IOException, InterruptedException {
	
	// split the line and write key=value pair
      	String[] values = value.toString().split("\t");
		word.set(values[1]);
		weight.set(Integer.parseInt(values[2]));
		
		context.write(word, weight);
    }
  }
	
public static class IntSumReducer
       extends Reducer<Text,IntWritable,Text,IntWritable> {
    private IntWritable result = new IntWritable();

    public void reduce(Text key, Iterable<IntWritable> values,
	               Context context
	               ) throws IOException, InterruptedException {
      int sum = 0;
      for (IntWritable val : values) {
		sum += val.get();
	  }
      result.set(sum);
      context.write(key, result);
    }
  }


  public static void main(String[] args) throws Exception {
	Configuration conf = new Configuration();
	Job job = Job.getInstance(conf, "Q1");

	job.setJarByClass(Q1.class);
	job.setMapperClass(TokenizerMapper.class);
	//job.setCombinerClass(IntSumReducer.class);
	job.setReducerClass(IntSumReducer.class);
	job.setOutputKeyClass(Text.class);
	job.setOutputValueClass(IntWritable.class);

	FileInputFormat.addInputPath(job, new Path(args[0]));
	FileOutputFormat.setOutputPath(job, new Path(args[1]));
	System.exit(job.waitForCompletion(true) ? 0 : 1);
  }
}
