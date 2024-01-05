<template>
<div>
  hello world {{slug}}

  <pre>{{photo}}</pre>
  
</div>
</template>
<script setup>

const params = useRoute().params
const slug = ref(params.slug[0])

const photo = ref(null)
// the slug is the photo ID
// now we will use /api/cloudinary to get the photo
// we will include the id as id in the query string
// we will get the photo and return it as json

/* example photo data
hello world bfnf0hklfcn8uaxbvajt
{
  "asset_id": "e4c05a5c2a5372f2fe04af2af1e34c17",
  "public_id": "bfnf0hklfcn8uaxbvajt",
  "format": "jpg",
  "version": 1693151230,
  "resource_type": "image",
  "type": "upload",
  "created_at": "2023-08-27T15:47:10+00:00",
  "bytes": 17341062,
  "width": 4160,
  "height": 6240,
  "backup": true,
  "folder": "",
  "access_mode": "public",
  "url": "http://res.cloudinary.com/ejf/image/upload/v1693151230/bfnf0hklfcn8uaxbvajt.jpg",
  "secure_url": "https://res.cloudinary.com/ejf/image/upload/v1693151230/bfnf0hklfcn8uaxbvajt.jpg",
  "next_cursor": "056795e2493531ad745fc082b392bca62b4ace546b7b412de395c05504e88a44",
  "etag": "0cbbf7e75e0ba03d86ee183d097e4ebb",
  "media_metadata": {
    "Make": "FUJIFILM",
    "Model": "X-Pro3",
    "Orientation": "Rotate 90 CW",
    "XResolution": "72",
    "YResolution": "72",
    "ResolutionUnit": "inches",
    "Software": "Digital Camera X-Pro3 Ver1.22",
    "ModifyDate": "2023:08:13 15:52:37",
    "Artist": "",
    "YCbCrPositioning": "Co-sited",
    "Copyright": "",
    "ExposureTime": "1/6400",
    "FNumber": "6.4",
    "ExposureProgram": "Program AE",
    "ISO": "8000",
    "SensitivityType": "Standard Output Sensitivity",
    "ExifVersion": "0230",
    "DateTimeOriginal": "2023:08:13 15:52:37",
    "CreateDate": "2023:08:13 15:52:37",
    "ComponentsConfiguration": "Y, Cb, Cr, -",
    "CompressedBitsPerPixel": "4.8",
    "ShutterSpeedValue": "1/6794",
    "ApertureValue": "6.5",
    "BrightnessValue": "6.4",
    "ExposureCompensation": "-0.33",
    "MaxApertureValue": "2.0",
    "MeteringMode": "Center-weighted average",
    "LightSource": "Unknown",
    "Flash": "No Flash",
    "FocalLength": "23.0 mm",
    "UserComment": "",
    "FlashpixVersion": "0100",
    "ColorSpace": "sRGB",
    "ExifImageWidth": "6240",
    "ExifImageHeight": "4160",
    "InteropIndex": "R98 - DCF basic file (sRGB)",
    "InteropVersion": "0100",
    "FocalPlaneXResolution": "2660",
    "FocalPlaneYResolution": "2660",
    "FocalPlaneResolutionUnit": "cm",
    "SensingMethod": "One-chip color area",
    "FileSource": "Digital Camera",
    "SceneType": "Directly photographed",
    "CustomRendered": "Custom",
    "ExposureMode": "Auto",
    "WhiteBalance": "Auto",
    "FocalLengthIn35mmFormat": "35 mm",
    "SceneCaptureType": "Standard",
    "Sharpness": "Normal",
    "SubjectDistanceRange": "Unknown",
    "SerialNumber": "94053188",
    "LensInfo": "23mm f/2",
    "LensMake": "FUJIFILM",
    "LensModel": "XF23mmF2 R WR",
    "LensSerialNumber": "9CB10798",
    "Compression": "JPEG (old-style)",
    "ThumbnailOffset": "3808",
    "ThumbnailLength": "9030",
    "Rating": "0",
    "Colorspace": "RGB",
    "DPI": "72"
  },
  "illustration_score": 0,
  "semi_transparent": false,
  "grayscale": true,
  "colors": [
    [
      "#252525",
      63
    ],
    [
      "#7A7A7A",
      24.4
    ],
    [
      "#D7D7D7",
      12.6
    ]
  ],
  "predominant": {
    "google": [
      [
        "black",
        63
      ],
      [
        "gray",
        24.4
      ],
      [
        "white",
        12.6
      ]
    ],
    "cloudinary": [
      [
        "black",
        63
      ],
      [
        "gray",
        24.4
      ],
      [
        "white",
        12.6
      ]
    ]
  },
  "pages": 1,
  "usage": {},
  "original_filename": "2023-08-16-DSCF6063",
  "rate_limit_allowed": 2000,
  "rate_limit_reset_at": "2023-08-28T01:00:00.000Z",
  "rate_limit_remaining": 1996,
  "filename": "bfnf0hklfcn8uaxbvajt",
  "uploaded_at": "2023-08-27T15:47:10+00:00",
  "backup_bytes": 17341062,
  "aspect_ratio": 0.66667,
  "pixels": 25958400,
  "tags": [],
  "image_metadata": {},
  "status": "active",
  "access_control": null,
  "created_by": {
    "access_key": "751378798145412"
  },
  "uploaded_by": {
    "access_key": "751378798145412"
  }
}

*/

// fetch(`/api/cloudinary?id=${slug.value}`)
fetch(`/api/cloudinary?id=${slug.value}`)
  .then(res => res.json())
  .then(data => {
    photo.value = data
    console.log(data)
  })
</script>