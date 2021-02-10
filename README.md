#  RiMod-FTD Webportal

## About

Post-mortem human brain tissue of the frontal lobe

## Design

### Color Palette
#00599c Dark Blue
#739dc3 Light Blue
#a4a4a4 Dark Gray
#f4f4f4 Light Gray

#505050 Body Text
#00589C; Body Blue
#bb2121; Emphasize

font-family: 'Roboto', 'Helvetica Neue Light', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;


## Data

* Methylation
* RNA-Seq
	* Variance Stabilized Transformed (VST) expression values from DE-SEQ	
* smRNA-seq

> Then there are Methylation, RNAsesq and smRNAseq files which contain normalized values for genes or CpGs with column names corresponding to sample IDs in the sample file.

## Questions

1. Should we indicate the brain region in the data file names, or should we treat samples from different regions but the same individual as different 'samples'? They should at least be connected via some ID, if one wants to check multiple regions for the same individual. 

## To Do

2. Why is methylation array so low?