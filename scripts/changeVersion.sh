MarketingVersion=$(egrep -o "[0-9]\.[0-9]+\.[0-9]+" ./ios/App/App.xcodeproj/project.pbxproj | head -1)

NewMarketingVersion=$(echo $MarketingVersion | awk -F. -v OFS=. 'NF==1{print ++$NF}; NF>1{if(length($NF+1)>length($NF))$(NF-1)++; $NF=sprintf("%0*d", length($NF), ($NF+1)%(10^length($NF))); print}') 
echo "Current Version is $MarketingVersion, changing to $NewMarketingVersion"

sed -i '' -e 's/MARKETING_VERSION \= [^\;]*\;/MARKETING_VERSION = '"$NewMarketingVersion"';/' ios/App/App.xcodeproj/project.pbxproj

newBuildVersion=${NewMarketingVersion/./0}
newBuildVersion=${newBuildVersion/./0}
newBuildVersion=${newBuildVersion/./0}
newBuildVersion="$newBuildVersion"1

sed -i '' -e 's/CURRENT_PROJECT_VERSION \= [^\;]*\;/CURRENT_PROJECT_VERSION = '"$newBuildVersion"';/' ios/App/App.xcodeproj/project.pbxproj
sed -i -r "s/\(versionCode[[:space:]]*\)[0-9]*/\\1${newBuildVersion}/" android/app/build.gradle
sed -i -r "s/\(versionNumber : [[:space:]]*\)[0-9]*/\\1${newBuildVersion}/" src/app/app-version.ts
sed -i -r "s/\(wwwVersionNumber : [[:space:]]*\)[0-9]*/\\1${newBuildVersion}/" src/app/app-version.ts

NewMarketingVersion='"'"$NewMarketingVersion"'"'
sed -i -r "s/\(versionName[[:space:]]*\)\"[0-9\.]*\"/\\1${NewMarketingVersion}/" android/app/build.gradle
sed -i -r "s/\(versionName : [[:space:]]*\)\"[0-9\.]*\"/\\1${NewMarketingVersion}/" src/app/app-version.ts
sed -i -r "s/\(wwwVersionName : [[:space:]]*\)\"[0-9\.]*\"/\\1${NewMarketingVersion}/" src/app/app-version.ts

echo $NewMarketingVersion