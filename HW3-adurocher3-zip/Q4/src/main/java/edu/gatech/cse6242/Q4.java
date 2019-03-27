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
import java.io.IOException;

public class Q4 {

	public static class TokenizerMapper1
	   extends Mapper<Object, Text, IntWritable, IntWritable>{

	private IntWritable source = new IntWritable();
	private IntWritable target = new IntWritable();

	public void map(Object key, Text value, Context context
	            ) throws IOException, InterruptedException {

		// split the line by \t and parse values
	  	String[] values = value.toString().split("\t");
		source.set(Integer.parseInt(values[0]));
		target.set(Integer.parseInt(values[1]));
		
		IntWritable plusOne = new IntWritable(1);
		IntWritable minusOne = new IntWritable(-1);
		// map source with 1
		context.write(source, plusOne);
		// map target with -1
		context.write(target, minusOne);
	}
	}

	public static class TokenizerMapper2
	   extends Mapper<Object, Text, IntWritable, IntWritable>{

	private IntWritable diff = new IntWritable();

	public void map(Object key, Text value, Context context
	            ) throws IOException, InterruptedException {

		// split the line by \t and parse value
	  	String[] values = value.toString().split("\t");
		diff.set(Integer.parseInt(values[1]));
		
		IntWritable plusOne = new IntWritable(1);
		// map diff with 1 (only the count)
		context.write(diff, plusOne);
	}
	}

	public static class IntSumReducer
       extends Reducer<IntWritable,IntWritable,IntWritable,IntWritable> {
    private IntWritable result = new IntWritable();

    public void reduce(IntWritable key, Iterable<IntWritable> values,
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
		Path temporary = new Path(args[1]+"-temp");

		Job job1 = Job.getInstance(conf, "Q4");
		job1.setJarByClass(Q4.class);
		// first mapping src:target -> src:1, target:-1
		job1.setMapperClass(TokenizerMapper1.class);
		// first reduce node:1 + node:1  ->  node:2
    		job1.setReducerClass(IntSumReducer.class);
		job1.setOutputKeyClass(IntWritable.class);
		job1.setOutputValueClass(IntWritable.class);

		// output using a temporary intermediary file
		FileInputFormat.addInputPath(job1, new Path(args[0]));
		FileOutputFormat.setOutputPath(job1, temporary);
		job1.waitForCompletion(true);


		Configuration conf2 = new Configuration();
		
		Job job2 = Job.getInstance(conf, "Q4bis");
		job2.setJarByClass(Q4.class);
		// second mapping node:2 -> 2:1
		job2.setMapperClass(TokenizerMapper2.class);
		// second reduce 2:1 + 2:1 ->  2:2
    		job2.setReducerClass(IntSumReducer.class);
		job2.setOutputKeyClass(IntWritable.class);
		job2.setOutputValueClass(IntWritable.class);
    		// input using the temporary file
		FileInputFormat.addInputPath(job2, temporary);
		FileOutputFormat.setOutputPath(job2, new Path(args[1]));

		System.exit(job2.waitForCompletion(true) ? 0 : 1);
	}
}
