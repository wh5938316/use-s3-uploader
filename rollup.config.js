import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';

export default {
    input: './src/index.ts',
    output: [{
      file: './dist/use-s3-uploader.js', // 通用模块
      format: 'umd',
    },
    {
      file: './dist/use-s3-uploader.module.js', // es6模块
      format: 'es',
    }],
    plugins: [
      typescript(),  // 会自动读取 文件tsconfig.json配置
      commonjs(),
      json(),
      nodeResolve(),
      babel()
    ]
}
