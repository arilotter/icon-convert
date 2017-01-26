# Icon-Convert

> Convert images (svg/png/jpg/gif) to icons (icns/ico/hqx/png)

This is an unofficial wrapper around the online icon converter at http://iconverticons.com/

**Why?**  
Converting images, especially SVGs, to .icns and .ico formats sucks. Especially if you don't own a Mac.
[image-to-icon-converter](https://www.npmjs.com/package/image-to-icon-converter) used to do the job, but the API it used no longer exists.

**How?**  
Upload an image to iconverticons, get back all sorts of wonderful icon formats.

## Features

- Takes in many types of image (svg/png/jpg/gif)
- Outputs to many common icon types (icns/hqx icns/ico/png)

## Installation

`npm install icon-convert`

## Usage
```bash
  $ icon-convert --help
```
**Example**
Upload `icon.svg`, convert it, and get an ICO, an ICNS and a 512x512 PNG:
```bash
  $ icon-convert --types ico,icns,png512 --out icons icon.svg
  $ ls icons # icon_512x512.png  icon.icns  icon.ico
```