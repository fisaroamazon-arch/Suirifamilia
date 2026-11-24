#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
sdk="${ANDROID_HOME:?Defina ANDROID_HOME para o SDK Android.}"
tools="$sdk/build-tools/35.0.0"
platform="$sdk/platforms/android-35/android.jar"
source=app/src/main
output="$PWD/build"
mkdir -p "$output/classes" "$output/dex" "$output/generated"

"$tools/aapt2" compile --dir "$source/res" -o "$output/resources.zip"
"$tools/aapt2" link -I "$platform" --manifest "$source/AndroidManifest.xml" --java "$output/generated" \
    -o "$output/resources.apk" "$output/resources.zip"

javac --release 8 -classpath "$platform" -d "$output/classes" \
    "$source/java/br/com/suirifamilia/app/MainActivity.java" \
    "$output/generated/br/com/suirifamilia/app/R.java"
jar cf "$output/classes.jar" -C "$output/classes" .
"$tools/d8" --min-api 26 --lib "$platform" --output "$output/dex" "$output/classes.jar"

cp "$output/resources.apk" "$output/unaligned.apk"
(cd "$output/dex" && zip -q -j "$output/unaligned.apk" classes.dex)
"$tools/zipalign" -f -p 4 "$output/unaligned.apk" "$output/aligned.apk"
"$tools/apksigner" sign --ks "${SUIRI_ANDROID_KEYSTORE:?Informe o keystore do Suiri Família.}" \
    --ks-key-alias "${SUIRI_ANDROID_KEY_ALIAS:?Informe o alias da chave.}" \
    --ks-pass env:SUIRI_ANDROID_STORE_PASSWORD --key-pass env:SUIRI_ANDROID_KEY_PASSWORD \
    --out "$output/suiri-familia.apk" "$output/aligned.apk"
"$tools/apksigner" verify "$output/suiri-familia.apk"
