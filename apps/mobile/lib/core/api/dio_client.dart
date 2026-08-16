import 'package:dio/dio.dart';

class SimoguDioClient {
  static final SimoguDioClient _instance = SimoguDioClient._internal();
  late Dio dio;

  factory SimoguDioClient() => _instance;

  SimoguDioClient._internal() {
    dio = Dio(
      BaseOptions(
        baseUrl: 'http://localhost:3001/api/v1',
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 10),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          // Token injection interceptor placeholder
          return handler.next(options);
        },
        onError: (DioException e, handler) {
          // Error handler interceptor placeholder
          return handler.next(e);
        },
      ),
    );
  }
}
