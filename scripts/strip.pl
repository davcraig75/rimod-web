#!/usr/bin/perl
`rm *.s.bed`;
`rm *.f.bed`;
foreach $file (@ARGV) {
   chomp($file);
   $file2=$file;
   $file3=$file;
   $file4=$file;
   $file2=~s/.bed/.s.bed/g;
   $file3=~s/.bed/.f.bed/g;
   $file4=~s/.bed/.f1.bed/g;
   open (FILE,"$file"); 
   open (FILE2,">$file2"); 
   print "$file2\n";
   while (<FILE>) {
     $_=~s/^chr//g;
     $_=~s/^X/23/g;
     $_=~s/^Y/24/g;
     $_=~s/^M/25/g;
     print FILE2 $_; 
   }
   close (FILE);
   close (FILE2);
   `sort -nk1,1 -nk2,2 < $file2 > $file3`;
}
