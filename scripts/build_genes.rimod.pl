#!/home/services/perl5/perlbrew/perls/perl-5.30.1/bin/perl -w
use MongoDB;
use BSON::Types ':all';
use Statistics::Descriptive;
use List::Util qw( min max );
use Data::Dumper;
use POSIX qw/ceil/;

$clinical_data="../../src/RiMod_master_sample_file.melt.tsv";
$port="27017";
$database="rimod";
@meta=(
    'Sex',
    'Disease',
    'Mutation',
    'Disease-Gene',
    'Gene',
    'Pathology'
);
my $sampleRef;
my %pivot;
my $annotateCollection = newConn( 'AnnotateByFoundinPD', 'gene', 'localhost:27020' );
my $infoCollection = newConn( 'AnnotateByFoundinPD', 'gene_info', 'localhost:27020' );
my $GeneDetailCollection  = newConn( $database, 'gene_detail', "localhost:$port" );
my $SummaryCollection = newConn( $database, 'gene_summary', "localhost:$port" );
$assays{"BulkRNA"}="RNAseq.version0.tsv";
$assays{"SmallRNA"}="smRNAseq.frontal.version1.tsv";
$drop=1;
$initialize_genes=1;

&clinical_info;
$valid_summary={};
$calc_public=1;

genes("BulkRNA",$assays{"BulkRNA"},",",$GeneDetailCollection);
genes("SMALLRNA",$assays{"SmallRNA"},",",$GeneDetailCollection);

sub cycle {    
    my ($assay) = @_;
	my $min=&find_min(\@buf);
    my $IQR_TPM={};
    my $RECORD={};	
    my $array=[]; 
    my $pivotRef=[];
    foreach my $cat (@meta) {
        $IQR_TPM->{$cat}={};
    }
    LOOP:for ($i=1;$i<$#salmonheader;++$i) {
        if (!exists($sampleRef{$assay}{$salmonheader[$i]})) {
            next LOOP;
        }
        if ($buf[$i]==0) { 
            $buf[$i]=$min;
        }
        $buf[$i]=sprintf("%.5g",$buf[$i])+0;
        my $t=log($buf[$i]+$min)/log(10)+0;
        $t=sprintf("%.5g",$t);
        my $hashRef={
            'uid'=>$sampleRef{$assay}{$salmonheader[$i]}{'UID'},
            $assay .'_Log_v0'=>$t,
            $assay . '_v0'=>$buf[$i]
        };
        for ($j=1;$j<=$#header;++$j) {
            $cat=$header[$j]; 
            if (exists($sampleRef{$assay}{$salmonheader[$i]}{$cat})){
                if (defined($sampleRef{$assay}{$salmonheader[$i]}{$cat})) {
                    if ($sampleRef{$assay}{$salmonheader[$i]}{$cat} ne "") {
                        if (defined($sampleRef{$assay}{$salmonheader[$i]}{$cat})) {
                            if (length($sampleRef{$assay}{$salmonheader[$i]}{$cat})>0) {
                                if (exists($IQR_TPM->{$cat})) {
                                    my $bin=$sampleRef{$assay}{$salmonheader[$i]}{$cat}; 
                                    if (exists($IQR_TPM->{$cat}->{$bin})) {
                                        if (exists($hashRef->{$assay .'_v0'})) {
                                            if (scalar($hashRef->{$assay .'_v0'})>0) {
                                                $IQR_TPM->{$cat}->{$bin}->add_data($hashRef->{$assay . '_v0'});
                                            }
                                        }
                                    } else {
                                        if (exists($hashRef->{$assay .'_v0'})) {
                                            if (scalar($hashRef->{$assay .'_v0'})>0) {  
                                                
                                                $valid_summary->{"$cat-$bin"}=1;  
                                                $IQR_TPM->{$cat}->{$bin}=Statistics::Descriptive::Full->new();;
                                                $IQR_TPM->{$cat}->{$bin}->add_data($hashRef->{$assay . '_v0'});
                                            }
                                        }
                                    }
                                }
                                $hashRef->{$cat}=$sampleRef{$assay}{$salmonheader[$i]}{$cat};
                            }
                        }
                    }
                }
            } 
        }        
        push(@{$array},$hashRef);
    }
    #print Dumper($array);
    if ($calc_public) {$pivotRef=summary_cat($IQR_TPM,$pivotRef,$assay)};
    my $n=scalar(@$array);
    return ($array,$pivotRef);
}

sub find_min {    
    my $bufr=shift;
    my $count=scalar(@{$bufr});
    my $minval=10000000;
    for (my $i=1;$i<$count;++$i) {
        if ($bufr->[$i]<$minval && $bufr->[$i]>0 ){
            $minval=$bufr->[$i];
        }   
    }
    if ($minval==10000000){$minval=0.000000001}	
    return $minval;
}

sub line {
	my $line=shift;
    $line=~s/\r//g;
    $line=~s/\n//g;
    $line=~s/\"//g;
    chomp($line);	
    return $line;
}

sub init_genes {
    $coll=$_[0];    
    $coll->drop;
    print "initializing genes\n";
    my $cursor=$annotateCollection->find({});
    if ($drop) {
        $coll->drop;
        if ($calc_public) {
            $SummaryCollection->drop;
        }
        if ($geneinfo) {
            $gene_info_collection->drop;
        }
    }
    while (my $doc=$cursor->next) {
        $jsonPD={
            'g0'=>$doc->{'g38'}->[0],
            'g1'=>$doc->{'g38'}->[1],
            'g38'=>$doc->{'g38'},
            'pos38'=>$doc->{'pos38'},
            'p0'=>$doc->{'pos38'}->[0],
            'p1'=>$doc->{'pos38'}->[1],
            'chr'=>$doc->{'chr'},
            'c'=>$doc->{'chr'},
            'gene'=>$doc->{'gene'},
            'dir'=>$doc->{'dir'},
            'transcripts'=>$doc->{"transcripts"},
            "canonical"=>$doc->{'canonical'}
        };
        $gene_info={
            'g0'=>$doc->{'g38'}->[0],
            'g1'=>$doc->{'g38'}->[1],
            'g38'=>$doc->{'g38'},
            'pos38'=>$doc->{'pos38'},
            'p0'=>$doc->{'pos38'}->[0],
            'p1'=>$doc->{'pos38'}->[1],
            'chr'=>$doc->{'chr'},
            'c'=>$doc->{'chr'},
            'gene'=>$doc->{'gene'},
            'dir'=>$doc->{'dir'},
            'name'=>$doc->{'name'},
            'transcripts'=>$doc->{"transcripts"},
            "canonical"=>$doc->{'canonical'}
        };
        KEY:foreach $key (keys %$doc) {
            if ($key eq "gtex") {next KEY}
            if ($key eq "gwas_disease") {next KEY}
            if ($key eq "gene_assoc") {next KEY}
            if ($key ne "_id") {
                if (defined($doc->{$key})) {

                    if (length($doc->{$key})>0) {
                        $jsonPD->{$key}=$doc->{$key};
                    }   
                } else {
                    print "not defined $key for $doc->{'_id'}\n";
                }
            }             
        }
        $jsonPD->{'g0'}=$jsonPD->{'g38'}->[0];
        $jsonPD->{'p0'}=$jsonPD->{'pos38'}->[0];
        $jsonPD->{'g1'}=$jsonPD->{'g38'}->[1];
        $jsonPD->{'p1'}=$jsonPD->{'pos38'}->[1];  
        $coll->insert_one($jsonPD);
        $SummaryCollection->insert_one($gene_info);
        #$gene_info_collection->insert_one($gene_info);        
    }
    my $indexesGeneDetailCollection = $coll->indexes;        
    $indexesGeneDetailCollection->create_one({'gene'=>1});
    $indexesGeneDetailCollection->create_one({'names'=>1});
    $indexesGeneDetailCollection->create_one({'transcripts'=>1});
    if ($geneinfo) {
        my $gene_info_indexes = $gene_info_collection->indexes;   
        $gene_info_indexes->create_one({'g0'=>1});
        $gene_info_indexes->create_one({'g1'=>1});
        $gene_info_indexes->create_one({'gene'=>1});
    }
    if ($calc_public) {
        my $indexesSummaryCollection = $SummaryCollection->indexes; 
        $indexesSummaryCollection->create_one({'gene'=>1});
        $indexesSummaryCollection->create_one({'transcripts'=>1});
        $indexesSummaryCollection->create_one({'names'=>1});
    }
    print "initializing genes complete\n";
}

sub genes {
    my ($assay,$filename,$delimin,$coll) = @_;
    print "starting $assay for $filename\n";
    if ($initialize_genes==1) {
        &init_genes($coll);
        $initialize_genes=0;
    }
    $input=$filename;
    open (INPUT, "$input") or die "Fail assay: $assay for $filename\n";
    print "opening $input\n";
    my $l=(<INPUT>);    
    my $line=line($l);
    $line=~s/\./_/g;
    @salmonheader=split(/\t/,$line);
    $delimit="comma";
    if ($#salmonheader>0) {
        $delimit="tab";
    } else {
        @salmonheader=split(/,/,$line);
    }
    LOOP2: while (<INPUT>) {
    	my $line=line($_);
        if ($delimit eq "comma") {
            @buf=split(/,/,$line);
        } else {
             @buf=split(/\t/,$line);
        }
        $buf[0]=uc($buf[0]);        
        $jsonPD={};  
        #$gene_check=$coll->count({'names'=>$buf[0]});
        #if ($gene_check==1) { 
            my $gene_rec=$coll->find_one({'names'=>$buf[0]});
            my $id=$gene_rec->{'_id'};
            if (exists($gene_rec->{'gene'})) {
                $jsonPD->{'gene'}=$gene_rec->{'gene'};
                my ($array,$pivotRef)=&cycle($assay);     
                print "gene:$jsonPD->{'gene'}\n";
                $jsonPD->{'summaries_'.$assay}=$pivotRef;
                
                $SummaryCollection->update_one({'gene'=>$jsonPD->{'gene'}},{'$set'=>{'summaries_'.$assay=>$pivotRef}});
                
                $jsonPD->{'samples_' . $assay}=$array;
                $coll->update_one({'_id'=>$id},{'$set'=>$jsonPD});
            }            
    	#} else { warn "-WARN: Couldnt find $buf[0] or too many $gene_check\n";}  	
    }
    close (INPUT);  	
}

sub clinical_info {
	open (FILE,$clinical_data)or die "Can't find Importing clinical annotation $clinical_data\n";
	print "Importing clinical annotation $clinical_data\n";
	$head=(<FILE>);
	chomp($head);
	$head=~s/\n//g;;  
	$head=~s/\r//g;;  
	@header=split(/\t/,$head);
	## Summary Table
    print "get clinical info\n"; 
	while (<FILE>) {
	    $line=$_;
	    $line=~s/\n//g;    
	    $line=~s/\r//g;    
	    chomp($line);
	    @temp=split(/\t/,$line);
        my $myindex=0;
        foreach my $ass (keys %assays) {
            if ($temp[1] eq $ass) {
                for ($i=0;$i<=$#header;++$i) {
                    if(defined($temp[$i])) {                
                        $sampleRef{$ass}{$temp[3]}{$header[$i]}=$temp[$i];
                        $val=$temp[$i];        
                        if (length($val)>0){
                          #  $lookup{$ass}{$temp[3]}{$header[$i]}=$val;
                            $pivot{$ass}{$header[$i]}{$val}=1;
                        }
                    }
                }                
            }
        }

	}
	close(FILE);
}

sub summary_cat {
    my $IQR_TPM=$_[0];
    my $pivotRef=$_[1];
    my $assay=$_[2];
    foreach my $cat (@meta) {        
        foreach my $bin (keys(%{$pivot{$assay}{$cat}})) {
            if (exists($valid_summary->{"$cat-$bin"})) {
                if ($bin ne "NA" && $IQR_TPM->{$cat}->{$bin}->count()>0) { 
                    $min=$IQR_TPM->{$cat}->{$bin}->min();
                    $q1=$IQR_TPM->{$cat}->{$bin}->quantile(3);
                    if (!(defined $q1)) {$q1=$min}
                    if (!(defined $f10)) {$f10=$min}
                    my $element_summary={
                        'q3'=>sprintf("%.4g",$IQR_TPM->{$cat}->{$bin}->quantile(3)),
                        'q1'=>sprintf("%.4g",$q1),
                        'min'=>sprintf("%.4g",$min),
                        'max'=>sprintf("%.4g",$IQR_TPM->{$cat}->{$bin}->quantile(4)),
                        'median'=>sprintf("%.4g",$IQR_TPM->{$cat}->{$bin}->quantile(2)),
                        'n'=>$IQR_TPM->{$cat}->{$bin}->count(),
                        'event'=>"$bin",
                        'type'=>$assay. "_Value",
                        'variable'=>"$cat"
                    };
                    push (@{$pivotRef},$element_summary);
                }
            }
        }
    } 
    return $pivotRef;   
}

sub newConn {
    my $db=shift;
    my $collection=shift;
    my $hostName=shift;
    my $client     = MongoDB->connect("mongodb://$hostName");
    my $genes = $client->ns("$db.$collection");
    print "Created $db - $collection on $hostName\n";
    return ($genes);
}

sub removeEntries {
     my    $database=shift;
     my    $collection=shift;
     my    $hostName=shift;
        ($conn,$db,$dbsnp)=newConn($database,$collection,$hostName);
        $dbsnp -> remove();
        $collection='collections';
        ($conn,$db,$dbsnp)=newConn($database,$collection,$hostName);
        $dbsnp ->{'collection'=>$collection};
}

