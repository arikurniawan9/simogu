import 'package:flutter_test/flutter_test.dart';
import 'package:simogu_mobile/main.dart';

void main() {
  testWidgets('SimoguApp smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const SimoguApp());

    expect(find.text('SIMOGU Mobile Active'), findsOneWidget);
    expect(find.text('Sistem Monitoring Kehadiran Guru'), findsOneWidget);
  });
}
