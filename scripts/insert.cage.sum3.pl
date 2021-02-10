#!/home/services/perl5/perlbrew/perls/perl-5.30.1/bin/perl -w
$| = 1;
use MongoDB;
use BSON::Types ':all';
use POSIX;
use Data::Dumper;

&get_clinical_data;
&gmap;

@fhs = map { open $fh, '<', $_; $fh } @files;
$buf=[];
$count=0;
$rec={};
for ($i=0;$i<=$#filelist;++$i) {
	$linelocat[$i]=0;
};	
$file_status=1;
$g0=10000;	
LOOP:while ($file_status) {
	++$count;
	$i=0;
	$json={};
	$jton={};
	$rec={};
    $added=0;
	$sum={};
	$ins={};	
	for ($i=0;$i<=$#filelist;++$i) {
		$buf->[$i]={};
	};
	$g0=$g0+100;
	$rec->{'g0'}=bson_int64($g0);
	foreach $bin (keys(%{$bins})) {
		foreach $cat (keys(%{$bins->{$bin}})) {
			$sum->{$bin}->{$cat}=0;
		}
	}
	if($count%10000==0) {print "count $count $rec->{'g0'}\n";}		
	LOOP1:for ($i=0;$i<=$#fhs;++$i) {		
		&check_record;
	}
	@sums=();
	$inserted_records=0;
	if (exists($rec->{'k'})) {
		$inserted_records=scalar(@{$rec->{'k'}});
	}
	if ($inserted_records>0) {
		foreach $bin (keys(%{$sum})) {
			foreach $cat (keys(%{$sum->{$bin}})) {
				if (exists($sum->{$bin})) {
					if (exists($sum->{$bin}->{$cat})) {
						if(exists($bins->{$bin}->{$cat}) && exists($ins->{$bin}->{$cat})) {
							if ($ins->{$bin}->{$cat}>5) {
								$val=$sum->{$bin}->{$cat}/$ins->{$bin}->{$cat};
								$sum_rec={
									"variable"=>$bin,
									"event"=>$cat,
									'count'=>$bins->{$bin}->{$cat},
									'v0'=>bson_double($val)
								};
								push(@sums,$sum_rec);		
							}		
						}		

					}
				}

			}
		}
	}
	$rec->{'summaries'}=\@sums;	
	$rec->{'added'}=$added;	
	if ($added>0) {
		$cage_collection->insert_one($rec);
	}	
	$json={};
	$jton={};
	$rec={};
	$added=0;
	$sum={};
	$ins={};
}
my $cage_collection_indexes = $cage_collection->indexes;
$cage_collection_indexes->create_one({'g0'=>1});

sub gmap {
   $chr2gpos{'1'}=0;
   $chr2gpos{'2'}=250000000;
   $chr2gpos{'3'}=495000000;
   $chr2gpos{'4'}=695000000;
   $chr2gpos{'5'}=890000000;
   $chr2gpos{'6'}=1075000000;
   $chr2gpos{'7'}=1250000000;
   $chr2gpos{'8'}=1412000000;
   $chr2gpos{'9'}=1560000000;
   $chr2gpos{'10'}=1700000000;
   $chr2gpos{'11'}=1835000000;
   $chr2gpos{'12'}=1972000000;
   $chr2gpos{'13'}=2107000000;
   $chr2gpos{'14'}=2223000000;
   $chr2gpos{'15'}=2333000000;
   $chr2gpos{'16'}=2438000000;
   $chr2gpos{'17'}=2533000000;
   $chr2gpos{'18'}=2618000000;
   $chr2gpos{'19'}=2700000000;
   $chr2gpos{'20'}=2760000000;
   $chr2gpos{'21'}=2826000000;
   $chr2gpos{'22'}=2876000000;
   $chr2gpos{'23'}=2928000000;
   $chr2gpos{'24'}=3088000000;
   $chr2gpos{'25'}=3148000000;  
   $chr2gpos{'X'}=2928000000;
   $chr2gpos{'Y'}=3088000000;
   $chr2gpos{'M'}=3148000000; 
   $chr2gpos{'MT'}=3148000000; 
}

sub get_clinical_data {
    open (CLI,"../../../src/RiMod_master_sample_file.melt.tsv");
    $line=(<CLI>);
    chomp($line);
	@head=split(/\t/,$line);
    $bins={};
	$samples={};
    while (<CLI>) {
        $line=$_;
        chomp($line);
        @temp=split(/\t/,$line);
		if (!exists($samples{$temp[3]})) {
			$samples{$temp[3]}=1;
			for ($q=4;$q<=$#temp;++$q) {
				
				$P{$temp[3]}{$head[$q]}=$temp[$q];
				if (exists($bins->{$head[$q]}->{$temp[$q]})) {++$bins->{$head[$q]}->{$temp[$q]};} else {$bins->{$head[$q]}->{$temp[$q]}=1;}
			}
		}
    }
    $cage_collection  = newConn( 'rimod', 'CAGE', "localhost:27017" );
    $cage_collection->drop();
    $filelist=`ls -1 *.bed`;
    @files=split(/\s+/,$filelist);
    for ($i=0;$i<=$#files;++$i) {
        if($files[$i]=~/CAGEseq\.(rimod.*?)\.f.bed/) {
            $filename2P[$i]=$1;
			
        }
    }
}

sub get_line {
	$file=$fhs[$i];
	$prevline="$files[$i] $i $line\n";
	if (!exists($buf->[$i]->{'record'})) {
		$line = <$file>;
	} else {
		$line=$buf->[$i]->{'record'};
	}	
	++$linelocat[$i];
	$json={};
	$jton={};	
	$buf->[$i]->{'record'}=$line;
	chomp($line);		
	@temp=split(/\t/,$line);
	if ($#temp != 5) {print "  -- Oh no!: $files[$i] saw $line which was '$prevline' with @temp for $linelocat[$i] on $count\n";die;}
	if ($line) {
		$temp[0]=~s/chr//;
		if (!exists($chr2gpos{$temp[0]})) {return 0}
		$buf->[$i]->{'temp'}=\@temp;
		return 1;
	} else {
		print "   -notfound\n";
		return 0;
	}
}

sub check_record {
	&get_line;
	$g=bson_int64(100*floor(($buf->[$i]->{'temp'}->[1]+$chr2gpos{$buf->[$i]->{'temp'}->[0]})/100));
	if ($g==$rec->{'g0'}) {
		delete($buf->[$i]->{'record'});
		&add_record;
	} elsif ($g < $rec->{'g0'}) {
		delete($buf->[$i]->{'record'});	
		&check_record;
	}
}

sub add_record {
	$jton->{'v0'}=bson_int32($buf->[$i]->{'temp'}->[4]);
	#print "$files[$i] v0:$jton->{'v0'}\n";
	$jton->{'UID'}=$filename2P[$i];
	$jton->{'Sample'}=$P{$jton->{'UID'}}{'Sample'};
	$jton->{'Sex'}=$P{$jton->{'UID'}}{'Sex'};
	$jton->{'Disease'}=$P{$jton->{'UID'}}{'Disease'};
	$jton->{'Mutation'}=$P{$jton->{'UID'}}{'Mutation'};
	$jton->{'Gene'}=$P{$jton->{'UID'}}{'Gene'};
	$jton->{'Pathology'}=$P{$jton->{'UID'}}{'Pathology'};	
	$jton->{'Disease-Gene'}=$P{$jton->{'UID'}}{'Disease-Gene'};	
	$json->{'U'}=$jton->{'UID'};
	$json->{'Sa'}=$jton->{'Sample'};
	$json->{'D'}=$jton->{'Disease'};
	$json->{'S'}=$P{$jton->{'UID'}}{'Sex'};
	$json->{'F'}=$P{$jton->{'UID'}}{'Disease-Gene'};
	$json->{'P'}=$P{$jton->{'UID'}}{'Pathology'};
	$json->{'G'}=$P{$jton->{'UID'}}{'Gene'};
	$json->{'M'}=$P{$jton->{'UID'}}{'Mutation'};			
	$json->{'dir'}=$buf->[$i]->{'temp'}->[5];
	$json->{'g0'}=bson_int64($buf->[$i]->{'temp'}->[1]+$chr2gpos{$buf->[$i]->{'temp'}->[0]});
	$sum->{'Sex'}->{$jton->{'Sex'}}+=$buf->[$i]->{'temp'}->[4];
	$sum->{'Mutation'}->{$jton->{'Mutation'}}+=$buf->[$i]->{'temp'}->[4];
	$sum->{'Disease'}->{$jton->{'Disease'}}+=$buf->[$i]->{'temp'}->[4];
	$sum->{'Gene'}->{$jton->{'Gene'}}+=$buf->[$i]->{'temp'}->[4];
	$sum->{'Pathology'}->{$jton->{'Pathology'}}+=$buf->[$i]->{'temp'}->[4];
	$sum->{'Disease-Gene'}->{$jton->{'Disease-Gene'}}+=$buf->[$i]->{'temp'}->[4];	

	++$ins->{'Sex'}->{$jton->{'Sex'}};
	++$ins->{'Mutation'}->{$jton->{'Mutation'}};
	++$ins->{'Disease'}->{$jton->{'Disease'}};	
	++$ins->{'Pathology'}->{$jton->{'Pathology'}};
	++$ins->{'Gene'}->{$jton->{'Gene'}};
	++$ins->{'Mutation'}->{$jton->{'Mutation'}};	

	$rec->{'c'}=$buf->[$i]->{'temp'}->[0];
	$json->{'p0'}=$buf->[$i]->{'temp'}->[1];
	$jton->{'v0'}=bson_int32($buf->[$i]->{'temp'}->[4]);	
	$json->{'v0'}=bson_int32($buf->[$i]->{'temp'}->[4]);	
	#print "v:$buf->[$i]->{'temp'}->[0]  $buf->[$i]->{'temp'}->[1]  $buf->[$i]->{'temp'}->[2]  $buf->[$i]->{'temp'}->[3] $buf->[$i]->{'temp'}->[4] $i\n";
	if($buf->[$i]->{'temp'}->[4]>0){
		++$added;		
		push(@{$rec->{'k'}},$json);
	}	
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

